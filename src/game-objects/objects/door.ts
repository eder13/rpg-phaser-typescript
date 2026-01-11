import { create } from 'lodash';
import { DEBUG_COLLISION_DOOR_TRANSITION_ZONE } from '../../common/globals';
import { DIRECTION, Direction, DoorType, TiledDoorObject, TrapType } from '../../common/tiled/types';
import { CustomGameObject, Position } from '../../common/types';
import { DOOR_TYPE } from '../../common/tiled/common';
import { ASSET_KEYS, DOOR_FRAME_KEYS } from '../../common/assets';

class Door implements CustomGameObject {
    public scene: Phaser.Scene;
    public roomid: number;
    public targetDoorId: number;
    public targetRoomId: number;
    public position: Position;
    public targetLevel: string;
    public doorTransitionZone: Phaser.GameObjects.Zone;
    public debugDoorTransitionZone: Phaser.GameObjects.Rectangle | undefined;
    public direction: Direction;
    public id: number;
    public isUnlocked: boolean;
    public doorObject: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;
    public trapDoorTrigger: TrapType;
    public doorType: DoorType;

    constructor(scene: Phaser.Scene, config: TiledDoorObject, roomId: number) {
        this.scene = scene;
        this.roomid = roomId;
        this.targetDoorId = config.targetDoorId;
        this.targetRoomId = config.targetRoomId;
        this.position = { x: config.x, y: config.y };
        this.targetLevel = config.targetLevel;
        this.doorTransitionZone = this.createDoorTransitionZone(config);
        this.debugDoorTransitionZone = DEBUG_COLLISION_DOOR_TRANSITION_ZONE
            ? this.createDebugDoorTransitionZone(config)
            : undefined;
        this.direction = config.direction;
        this.id = config.id;
        this.isUnlocked = config.isUnlocked;
        this.trapDoorTrigger = config.trapDoorTrigger;
        this.doorType = config.doorType;
        this.doorObject = this.createDoorObjectIfNecessary();

        this.scene.physics.world.enable(this.doorTransitionZone);
    }

    private createDoorObjectIfNecessary() {
        if (this.doorType === DOOR_TYPE.OPEN) {
            return undefined;
        }

        const frameName = DOOR_FRAME_KEYS[`${this.doorType}_${this.direction}`];

        let x = this.position.x;

        // HACK I do not know why this is necessary, but it fixes the door position for specific doors
        if (this.position.x === 1248 && this.position.y === 880) {
            x += 1;
        }
        if (this.position.x === 1304.5414746579 && this.position.y === 880.508529503578) {
            x -= 1;
        }

        const door = this.scene.physics.add
            .image(x, Math.round(this.position.y), ASSET_KEYS.DUNGEON_OBJECTS, frameName)
            .setImmovable(true)
            .setDepth(4)
            .setName(this.id.toString(10));

        switch (this.direction) {
            case DIRECTION.UP:
                door.setOrigin(0, 0.5);
                break;
            case DIRECTION.DOWN:
                door.setOrigin(0, 0.75);
                break;
            case DIRECTION.LEFT:
                door.setOrigin(0.25, 1);
                break;
            case DIRECTION.RIGHT:
                door.setOrigin(0.5, 1);
                break;
        }

        return door;
    }

    private createDoorTransitionZone(config: TiledDoorObject): Phaser.GameObjects.Zone {
        return this.scene.add
            .zone(this.position.x, this.position.y, config.width, config.height)
            .setOrigin(0, 1)
            .setName(config.id.toString());
    }

    private createDebugDoorTransitionZone(config: TiledDoorObject): Phaser.GameObjects.Rectangle | undefined {
        return this.scene.add
            .rectangle(this.position.x, this.position.y, config.width, config.height, 0x00ff00, 0.5)
            .setOrigin(0, 1)
            .setName(config.id.toString())
            .setDepth(50);
    }

    public enableObject(): void {
        console.log('#####** Enabling door transition zone for door id:', this.doorTransitionZone.name);
        (this.doorTransitionZone as any).body.enabled = true;
        (this.doorTransitionZone as any).body.active = true;
        (this.doorTransitionZone as any).body.visible = true;

        if (this.doorObject) {
            (this.doorObject as any).body.enabled = true;
            (this.doorObject as any).body.active = true;
            (this.doorObject as any).body.visible = true;
        }
    }

    public disableObject(disableDoorTrigger = true, disableDoorObject = false): void {
        if (disableDoorTrigger) {
            (this.doorTransitionZone as any).body.enabled = false;
            (this.doorTransitionZone as any).body.active = false;
            (this.doorTransitionZone as any).body.visible = false;
        }

        console.log('####** [btn] this.doorObect', this.doorObject);
        console.trace('[btn]');

        if (this.doorObject && disableDoorObject) {
            // zuverlässig Body  Sprite deaktivieren
            // 1) disableBody sorgt dafür, dass Body aus physics world entfernt wird und Sprite hidden/ inactive wird
            (this.doorObject as Phaser.Physics.Arcade.Image).disableBody(true, true);

            // 2) zusätzlich sicherstellen, dass collision checks aus sind
            const body = (this.doorObject as any).body as Phaser.Physics.Arcade.Body | undefined;
            if (body) {
                body.checkCollision.none = true;
                body.enable = false;
                body.stop();
            }

            // 3) falls du Groups nutzt: entferne es aus blockingGroup, sonst Collider gegen Gruppe feuert eventuell weiter
            const bg = (this.scene as any).blockingGroup as Phaser.GameObjects.Group | undefined;
            if (bg && bg.contains(this.doorObject)) {
                bg.remove(this.doorObject, false, false);
            }
        }

        console.log('####** [btn] this.doorObect disabled', this.doorObject);
    }

    public openDoor() {
        console.log('[btn] #####** this.doorType', this.doorType);

        if (this.doorType === DOOR_TYPE.OPEN) {
            return;
        }

        this.scene.sound.play('SFX_DOOR_OPEN', { volume: 0.4, seek: 0.75 });

        //if (this.doorType === DOOR_TYPE.LOCK || this.doorType === DOOR_TYPE.BOSS) {
        this.isUnlocked = true;

        // disable overlayed locked door object and enable transition zone for room transition
        this.disableObject(false, true);
        //}
    }
}

export default Door;
