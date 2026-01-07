export const ASSET_PACK_KEYS = {
    MAIN: 'MAIN',
} as const;

export const ASSET_KEYS = {
    PLAYER: 'PLAYER',
    PLAYER_DEATH: 'PLAYER_DEATH',
    POT: 'POT',
    POT_BREAK: 'POT_BREAK',
    SPIDER: 'SPIDER',
    SPIDER_RED: 'SPIDER_RED',
    SPIKE: 'SPIKE',
    BLOB: 'BLOB',
    SAW: 'SAW',
    FIRE: 'FIRE',
    FIRE_IDLE: 'FIRE_IDLE',
    WISP: 'WISP',
    DROW: 'DROW',
    DAGGER: 'DAGGER',
    DUNGEON_1_BACKGROUND: 'DUNGEON_1_BACKGROUND',
    DUNGEON_1_FOREGROUND: 'DUNGEON_1_FOREGROUND',
    DUNGEON_1_LEVEL: 'DUNGEON_1_LEVEL',
    COLLISION: 'COLLISION',
    DUNGEON_OBJECTS: 'DUNGEON_OBJECTS',
    ENEMY_DEATH: 'ENEMY_DEATH',
    UI_DIALOG: 'UI_DIALOG',
    UI_ICONS: 'UI_ICONS',
    UI_CURSOR: 'UI_CURSOR',
    WORLD_BACKGROUND: 'WORLD_BACKGROUND',
    WORLD_FOREGROUND: 'WORLD_FOREGROUND',
    WORLD_LEVEL: 'WORLD_LEVEL',
    HUD_NUMBERS: 'HUD_NUMBERS',
    FONT_PRESS_START_2P: 'FONT_PRESS_START_2P',
} as const;

export const PlayerAnimation = {
    IDLE_DOWN: 'idle_down',
    WALKING_DOWN: 'walking_down',
    PICKUP_DOWN: 'pickup_down',
    PICKUP_DOWN_IDLE: 'pickup_down_idle',
    PLAYER_HURT: 'hurt',
    PLAYER_DEATH: 'player_dead',
    PICKUP_WALKING_DOWN: 'pickup_down_walking',
    IDLE_RIGHT: 'idle_right',
    WALKING_RIGHT: 'walking_right',
    PICKUP_RIGHT: 'pickup_right',
    PICKUP_RIGHT_IDLE: 'pickup_right_idle',
    PICKUP_WALKING_RIGHT: 'pickup_right_walking',
    IDLE_UP: 'idle_up',
    WALKING_UP: 'walking_up',
    PICKUP_UP: 'pickup_up',
    PICKUP_UP_IDLE: 'pickup_up_idle',
    PICKUP_WALKING_UP: 'pickup_walking_up',
    IDLE_LEFT: 'idle_left',
    WALKING_LEFT: 'walking_left',
    PICKUP_LEFT: 'pickup_left',
    PICKUP_LEFT_IDLE: 'pickup_left_idle',
    PICKUP_WALKING_LEFT: 'pickup_left_walking',
};

/* export const PLAYER_ANIMATION_KEYS = {
    WALK_DOWN: 'player_walk_down',
    WALK_UP: 'player_walk_up',
    WALK_SIDE: 'player_walk_side',
    IDLE_DOWN: 'player_idle_down',
    IDLE_UP: 'player_idle_up',
    IDLE_SIDE: 'player_idle_side',
    IDLE_HOLD_DOWN: 'player_hand_in_air_down',
    IDLE_HOLD_UP: 'player_hand_in_air_up',
    IDLE_HOLD_SIDE: 'player_hand_in_air_side',
    WALK_HOLD_DOWN: 'player_walk_hand_in_air_down',
    WALK_HOLD_UP: 'player_walk_hand_in_air_up',
    WALK_HOLD_SIDE: 'player_walk_hand_in_air_side',
    LIFT_DOWN: 'player_open_chest_down',
    LIFT_UP: 'player_open_chest_up',
    LIFT_SIDE: 'player_open_chest_side',
    HURT_DOWN: 'player_hit_down',
    HURT_UP: 'player_hit_up',
    HURT_SIDE: 'player_hit_side',
    DIE_DOWN: 'player_die_down',
    DIE_UP: 'player_die_up',
    DIE_SIDE: 'player_die_side',
    SWORD_1_ATTACK_DOWN: 'player_atk_1_down',
    SWORD_1_ATTACK_UP: 'player_atk_1_up',
    SWORD_1_ATTACK_SIDE: 'player_atk_1_side',
} as const; */

export const SAW_ANIMATION_KEYS = {
    WALK: 'saw_blade',
};

export const FIRE_ANIMATION_KEYS = {
    FIRE_ANIMATION: 'fire_animation',
};

export const SPIKE_ANIMATION_KEYS = {
    IDLE: 'idle_spike_animation',
};

export const BLOB_ANIMATION_KEYS = {
    MOVE_UP: 'move_up',
    MOVE_DOWN: 'move_down',
    MOVE_LEFT: 'move_left',
    MOVE_RIGHT: 'move_right',
    DEATH: ASSET_KEYS.ENEMY_DEATH,
};

export const SPIDER_ANIMATION_KEYS = {
    WALK: 'spider_walk',
    HIT: 'spider_hit',
    DEATH: ASSET_KEYS.ENEMY_DEATH,
} as const;

export const SPIDER_RED_ANIMATION_KEYS = {
    IDLE_DOWN: 'spider_idle_down',
    IDLE_RIGHT: 'spider_idle_right',
    IDLE_UP: 'spider_idle_up',
    IDLE_LEFT: 'spider_idle_left',
    DEATH: ASSET_KEYS.ENEMY_DEATH,
} as const;

export const DROW_ANIMATION_KEYS = {
    WALK_DOWN: 'drow_walk_down',
    WALK_UP: 'drow_walk_up',
    WALK_LEFT: 'drow_walk_left',
    WALK_RIGHT: 'drow_walk_right',
    IDLE_DOWN: 'drow_idle_down',
    IDLE_UP: 'drow_idle_up',
    IDLE_SIDE: 'drow_idle_right',
    HIT: 'drow_hit',
    ATTACK_DOWN: 'drow_atk_down',
    ATTACK_UP: 'drow_atk_up',
    ATTACK_SIDE: 'drow_atk_right',
} as const;

export const WISP_ANIMATION_KEYS = {
    IDLE: 'wisp_idle',
} as const;

export const CHEST_FRAME_KEYS = {
    BIG_CHEST_CLOSED: 'big_chest_closed.png',
    SMALL_CHEST_CLOSED: 'chest_closed.png',
    BIG_CHEST_OPEN: 'big_chest_open.png',
    SMALL_CHEST_OPEN: 'chest_open.png',
} as const;

export const DOOR_FRAME_KEYS = {
    TRAP_LEFT: 'trap_left.png',
    TRAP_RIGHT: 'trap_right.png',
    TRAP_UP: 'trap_up.png',
    TRAP_DOWN: 'trap_down.png',
    BOSS_LEFT: 'boss_left.png',
    BOSS_RIGHT: 'boss_right.png',
    BOSS_UP: 'boss_up.png',
    BOSS_DOWN: 'boss_down.png',
    LOCK_LEFT: 'lock_left.png',
    LOCK_RIGHT: 'lock_right.png',
    LOCK_UP: 'lock_up.png',
    LOCK_DOWN: 'lock_down.png',
} as const;

export const BUTTON_FRAME_KEYS = {
    FLOOR_SWITCH: 'floor_switch.png',
    PLATE_SWITCH: 'plate_switch.png',
} as const;

export const CHEST_REWARD_TO_TEXTURE_FRAME = {
    SMALL_KEY: 119,
    BOSS_KEY: 121,
    MAP: 117,
    COMPASS: 118,
    NOTHING: 126,
} as const;

export const HEART_ANIMATIONS = {
    LOSE_LAST_HALF: 'heart_lose_last_half',
    LOSE_FIRST_HALF: 'heart_lost_first_half',
};

export const HEART_TEXTURE_FRAME = {
    NONE: '15',
    FULL: '10',
    EMPTY: '14',
    HALF: '12',
} as const;
