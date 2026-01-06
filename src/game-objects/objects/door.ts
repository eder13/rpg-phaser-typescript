import { Direction, TiledDoorObject } from '../../common/tiled/types';
import { CustomGameObject, GameObject, Position } from '../../common/types';

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

    constructor(scene: Phaser.Scene, config: TiledDoorObject, roomId: number) {
        this.scene = scene;
        this.roomid = roomId;
        this.targetDoorId = config.targetDoorId;
        this.targetRoomId = config.targetRoomId;
        this.position = { x: config.x, y: config.y };
        this.targetLevel = config.targetLevel;
        this.doorTransitionZone = this.createDoorTransitionZone(config);
        this.debugDoorTransitionZone = this.createDebugDoorTransitionZone(config);
        this.direction = config.direction;

        this.scene.physics.world.enable(this.doorTransitionZone);
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
        (this.doorTransitionZone as any).body?.setEnable(true);
        (this.doorTransitionZone as any).body?.setActive(true);
    }

    public disableObject(): void {
        (this.doorTransitionZone as any).body?.setEnable(false);
        (this.doorTransitionZone as any).body?.setActive(false);
    }
}

export default Door;
