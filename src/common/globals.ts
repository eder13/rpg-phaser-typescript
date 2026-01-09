export const LOG_ENABLED_STATE = false;

export const DEBUG_COLLISION_PLAYER_TILEMAP = false;
export const DEBUG_COLLISION_ENEMY_TILEMAP = false;
export const DEBUG_COLLISION_DOOR_TRANSITION_ZONE = false;

export const DIRECTION = {
    isMovingRight: false,
    isMovingLeft: false,
    isMovingUp: false,
    isMovingDown: false,

    // diagonal movement
    isMovingUpRight: false,
    isMovingDownRight: false,
    isMovingDownLeft: false,
    isMovingUpLeft: false,

    isPlayerMoving: false,
};

export const BLOCK_ATTACK_MOVEMENT = {
    blockAttackMovement: false,
};

export const ATTACK_STARTED = {
    attackStarted: false,
};

export const DIRECTION_SPIDER = {
    isMovingRight: false,
    isMovingLeft: false,
    isMovingUp: false,
    isMovingDown: false,
};

export const DIRECTION_BLOB = {
    isMovingRight: false,
    isMovingLeft: false,
    isMovingUp: false,
    isMovingDown: false,
};

export const DIRECTION_SAW = {
    isMovingRight: false,
    isMovingLeft: false,
    isMovingUp: false,
    isMovingDown: false,
};

export const SPEED_PLAYER = 120;

export const SPEED_SPIDER = 150;

export const DELAY_SPIDER_CHANGE_DIRECTION_MIN = 500;
export const DELAY_SPIDER_CHANGE_DIRECTION_MAX = 1500;
export const DELAY_SPIDER_CHANGE_DIRECTION_WAIT = 200;

export const SPEED_SAW_BOUNCE = 100;
export const TWEEN_SCALE_X_PULSE = 0.8;
export const TWEEN_SCALE_Y_PULSE = 0.8;
export const TWEEN_DURATION = 500;

export const BLOB_HURT_PUSHBACK_SPEED = 70;

export const DELAY_BLOB_CHANGE_DIRECTION_MIN = 200;
export const DELAY_BLOB_CHANGE_DIRECTION_MAX = 800;
export const DELAY_BLOB_CHANGE_DIRECTION_WAIT = 100;

export const SPEED_BLOB = 100;

export const BLOB_HEALTH = 3;

export const PLAYER_INVULNERABLE_DURATION = 500;

export const SAW_INVULNERABLE_DURATION = Infinity;

export const PUSH_BACK_SPEED = 100;
export const SPIDER_HURT_PUSHBACK_SPEED = 50;
export const DELAYED_PUSH_BACK_HURT_RESET = 200;

export const PLAYER_HEALTH = 12;
export const SPIDER_HEALTH = 2;

export const CHEST_STATE = {
    HIDDEN: 'HIDDEN',
    REVEALED: 'REVEALED',
    OPEN: 'OPEN',
} as const;

export const INTERACTIVE_OBJECT_TYPE = {
    AUTO: 'AUTO',
    PICKUP: 'PICKUP',
    OPEN: 'OPEN',
} as const;

export const THROW_SPEED = 300;
export const THROW_ITEM_DELAY_BEFORE_CALLBACK = 200;

export const LEVEL_NAME = {
    WORLD: 'WORLD',
    DUNGEON_1: 'DUNGEON_1',
} as const;

export const DELAY_DOOR_TRANSITION_DISABLED_COLLISION_OVERLAP_AND_LOCK_INPUT = 500;

export const DURATION_TWEEN_FOCUS_PLAYER_CAMERA = 500;
export const DELAY_TWEEN_FOCUS_PLAYER_CAMERA = 100;

export const DURATION_BETWEEN_FOCUS_ROOM_CAMERA = 500;
export const DELAY_BETWEEN_FOCUS_ROOM_CAMERA = 100;

export const FREEZE_TIME_ENEMIES_ROOM_TRANSITION = 800;

export const WORLD_FREEZE_STATE = { isFrozen: false };
export const WORLD_FREEZE_STATE_PLAYER = { isFrozen: false };

export const DURATION_FREEZE_SHOW_ITEM_REVEALED_CHEST = 3000;
export const DELAY_BEFORE_ITEM_REVEALED_MOVE_UP = 200;
export const DELAY_BEFORE_ITEM_STOP = 200;
