"""Games API router."""
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

import structlog

from src.core import (
    CurrentUser,
    DbSession,
    TeamMemberAccess,
    TeamCoachAccess,
    GameMemberAccess,
    GameCoachAccess,
)
from src.models import Game, Team, TeamMember, BasketballGameStats, Report
from src.schemas import (
    GameCreate,
    GameUpdate,
    GameOut,
    GameWithStats,
    BasketballStatsCreate,
    BasketballStatsUpdate,
    BasketballStatsOut,
)

logger = structlog.get_logger()

router = APIRouter(tags=["Games"])


@router.post(
    "/teams/{team_id}/games",
    response_model=GameOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_game(
    game_in: GameCreate,
    team: TeamCoachAccess,
    current_user: CurrentUser,
    db: DbSession,
) -> Game:
    """
    Create a new game for a team.

    Requires coach or owner role.
    """
    # Create the game
    game = Game(
        team_id=team.id,
        opponent_name=game_in.opponent_name,
        game_date=game_in.game_date,
        location=game_in.location,
        notes=game_in.notes,
    )
    db.add(game)
    db.commit()
    db.refresh(game)

    logger.info(
        "Game created",
        game_id=str(game.id),
        team_id=str(team.id),
        opponent=game_in.opponent_name,
    )

    return game


@router.get("/teams/{team_id}/games", response_model=list[GameOut])
async def list_games(
    team: TeamMemberAccess,
    current_user: CurrentUser,
    db: DbSession,
) -> list[dict]:
    """
    List all games for a team.

    Requires team membership.
    """
    games = (
        db.query(Game)
        .filter(Game.team_id == team.id)
        .order_by(Game.game_date.desc())
        .all()
    )

    # Add has_stats and has_report flags
    result = []
    for game in games:
        stats = (
            db.query(BasketballGameStats)
            .filter(BasketballGameStats.game_id == game.id)
            .first()
        )
        report = db.query(Report).filter(Report.game_id == game.id).first()

        result.append(
            {
                "id": game.id,
                "team_id": game.team_id,
                "opponent_name": game.opponent_name,
                "game_date": game.game_date,
                "location": game.location,
                "notes": game.notes,
                "created_at": game.created_at,
                "has_stats": stats is not None,
                "has_report": report is not None,
            }
        )

    return result


@router.get("/games/{game_id}", response_model=GameWithStats)
async def get_game(
    game: GameMemberAccess,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """
    Get game details with stats.

    Requires team membership.
    """
    stats = (
        db.query(BasketballGameStats)
        .filter(BasketballGameStats.game_id == game.id)
        .first()
    )

    return {
        "id": game.id,
        "team_id": game.team_id,
        "opponent_name": game.opponent_name,
        "game_date": game.game_date,
        "location": game.location,
        "notes": game.notes,
        "created_at": game.created_at,
        "basketball_stats": stats,
    }


@router.patch("/games/{game_id}", response_model=GameOut)
async def update_game(
    game_in: GameUpdate,
    game: GameCoachAccess,
    current_user: CurrentUser,
    db: DbSession,
) -> Game:
    """
    Update game details.

    Requires coach or owner role.
    """
    # Update only provided fields
    update_data = game_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(game, field, value)

    db.commit()
    db.refresh(game)

    logger.info(
        "Game updated",
        game_id=str(game.id),
        updated_fields=list(update_data.keys()),
    )

    return game


@router.delete("/games/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_game(
    game: GameCoachAccess,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    """
    Delete a game.

    Requires coach or owner role. This will also delete stats and reports.
    """
    game_id = game.id
    db.delete(game)
    db.commit()

    logger.info(
        "Game deleted",
        game_id=str(game_id),
        deleted_by=str(current_user.id),
    )


# Basketball Stats endpoints


@router.post(
    "/games/{game_id}/stats/basketball",
    response_model=BasketballStatsOut,
    status_code=status.HTTP_201_CREATED,
)
async def add_basketball_stats(
    stats_in: BasketballStatsCreate,
    game: GameCoachAccess,
    current_user: CurrentUser,
    db: DbSession,
) -> BasketballGameStats:
    """
    Add basketball stats to a game.

    Requires coach or owner role. Only one stats entry per game is allowed.
    """
    # Check if stats already exist
    existing = (
        db.query(BasketballGameStats)
        .filter(BasketballGameStats.game_id == game.id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Stats already exist for this game. Use PATCH to update.",
        )

    # Create stats
    stats = BasketballGameStats(
        game_id=game.id,
        **stats_in.model_dump(),
    )
    db.add(stats)
    db.commit()
    db.refresh(stats)

    logger.info(
        "Basketball stats added",
        game_id=str(game.id),
        stats_id=str(stats.id),
        score=f"{stats.points_for}-{stats.points_against}",
    )

    return stats


@router.get("/games/{game_id}/stats/basketball", response_model=BasketballStatsOut)
async def get_basketball_stats(
    game: GameMemberAccess,
    current_user: CurrentUser,
    db: DbSession,
) -> BasketballGameStats:
    """
    Get basketball stats for a game.

    Requires team membership.
    """
    stats = (
        db.query(BasketballGameStats)
        .filter(BasketballGameStats.game_id == game.id)
        .first()
    )
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No stats found for this game",
        )

    return stats


@router.patch(
    "/games/{game_id}/stats/basketball",
    response_model=BasketballStatsOut,
)
async def update_basketball_stats(
    stats_in: BasketballStatsUpdate,
    game: GameCoachAccess,
    current_user: CurrentUser,
    db: DbSession,
) -> BasketballGameStats:
    """
    Update basketball stats for a game.

    Requires coach or owner role.
    """
    stats = (
        db.query(BasketballGameStats)
        .filter(BasketballGameStats.game_id == game.id)
        .first()
    )
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No stats found for this game",
        )

    # Update only provided fields
    update_data = stats_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(stats, field, value)

    db.commit()
    db.refresh(stats)

    logger.info(
        "Basketball stats updated",
        game_id=str(game.id),
        stats_id=str(stats.id),
        updated_fields=list(update_data.keys()),
    )

    return stats
