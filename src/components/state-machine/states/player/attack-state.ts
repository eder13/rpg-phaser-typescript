import { PlayerAnimation } from '../../../../common/assets';
import { ATTACK_DIRECTION, BLOCK_ATTACK_MOVEMENT, DIRECTION } from '../../../../common/globals';
import Player from '../../../../game-objects/player/player';
import AbstractMovableState from '../../base/abstract-movable-state';
import { PlayerStates } from '../states';
import { DIRECTION as DIRECTION_HIT } from '../../../../common/tiled/types';

class AttackState extends AbstractMovableState {
    private attackStarted = false;
    private weapon!: Phaser.GameObjects.Sprite;
    private weaponCollider?: Phaser.Physics.Arcade.Collider;

    private ensureWeapon() {
        const player: any = this.gameObject;
        if (player.weapon) {
            this.weapon = player.weapon;
            return;
        }
        // Erzeuge das Weapon-Sprite einmal (ersetze 'WEAPON_KEY' durch deinen Asset-Key)
        this.weapon = this.gameObject.scene.add
            .sprite(0, 0, 'WEAPON_KEY', 0)
            .setOrigin(0.5, 0.5)
            .setDepth(this.gameObject.depth + 1)
            .setVisible(false);

        // optional Physics-Body für Overlap/Hits
        this.gameObject.scene.physics.add.existing(this.weapon);
        const wBody = this.weapon.body as Phaser.Physics.Arcade.Body;
        if (wBody) {
            wBody.setEnable(false); // nur während Attack aktivieren
            wBody.setImmovable(true);
            wBody.setAllowGravity(false);
        }

        // store on player to reuse
        player.weapon = this.weapon;
    }

    constructor(gameObject: Player) {
        super(PlayerStates.ATTACK, gameObject);
    }

    onExit() {
        super.onExit();
    }

    onEnter(args?: unknown[]) {
        this.ensureWeapon();

        this.attackStarted = true;
        this.gameObject.invulnerableComponent.invulnerable = true;

        this.gameObject.updateVelocity(true, 0);
        this.gameObject.updateVelocity(false, 0);

        // OFFSETS: dx/dy sind Pixel-Offsets vom Player-Zentrum zur Weapon-Position; feinjustieren!
        const OFFSETS: Record<string, { dx: number; dy: number; anim: string; flip?: boolean; direction: string }> = {
            down: { dx: -3, dy: 5, anim: PlayerAnimation.ATTACK_DOWN, direction: DIRECTION_HIT.DOWN },
            up: { dx: 1, dy: -1, anim: PlayerAnimation.ATTACK_UP, direction: DIRECTION_HIT.UP },
            left: { dx: -5, dy: 4, anim: PlayerAnimation.ATTACK_LEFT, flip: false, direction: DIRECTION_HIT.LEFT },
            right: { dx: 5, dy: 2, anim: PlayerAnimation.ATTACK_RIGHT, direction: DIRECTION_HIT.RIGHT },
        };

        let key: { dx: number; dy: number; anim: string; flip?: boolean; direction: string } | undefined;

        if (DIRECTION.isMovingUp) key = OFFSETS.up;
        else if (DIRECTION.isMovingLeft) key = OFFSETS.left;
        else if (DIRECTION.isMovingRight) key = OFFSETS.right;
        else if (DIRECTION.isMovingDown) key = OFFSETS.down;

        if (key) {
            if (key.direction === DIRECTION_HIT.DOWN) {
                ATTACK_DIRECTION.DOWN = true;
                ATTACK_DIRECTION.LEFT = false;
                ATTACK_DIRECTION.RIGHT = false;
                ATTACK_DIRECTION.UP = false;
            } else if (key.direction === DIRECTION_HIT.UP) {
                ATTACK_DIRECTION.UP = true;
                ATTACK_DIRECTION.LEFT = false;
                ATTACK_DIRECTION.RIGHT = false;
                ATTACK_DIRECTION.DOWN = false;
            } else if (key.direction === DIRECTION_HIT.LEFT) {
                ATTACK_DIRECTION.LEFT = true;
                ATTACK_DIRECTION.UP = false;
                ATTACK_DIRECTION.RIGHT = false;
                ATTACK_DIRECTION.DOWN = false;
            } else if (key.direction === DIRECTION_HIT.RIGHT) {
                ATTACK_DIRECTION.RIGHT = true;
                ATTACK_DIRECTION.UP = false;
                ATTACK_DIRECTION.LEFT = false;
                ATTACK_DIRECTION.DOWN = false;
            }
        }

        // positioniere Weapon und zeige sie
        this.weapon.setPosition(this.gameObject.x + (key?.dx ?? 0), this.gameObject.y + (key?.dy ?? 0));
        this.weapon.setFlipX(!!key?.flip);
        this.weapon.setVisible(true);

        // hide player visuals but keep physics body active
        const player: any = this.gameObject;
        const hadAnims = !!player.anims;
        if (hadAnims) player.anims.pause(); // Animation anhalten
        player.setVisible(false); // Sprite ausblenden (Body bleibt aktiv)

        // aktiviere Body für Overlap während Attack (falls vorhanden)
        const wBody = this.weapon.body as Phaser.Physics.Arcade.Body | undefined;
        if (wBody) wBody.setEnable(true);

        // optional: einmaligen overlap gegen Enemies einrichten (erstellt beim ersten Angriff)
        if (!this.weaponCollider) {
            const enemies = (this.gameObject.scene as any).enemyGroup as Phaser.GameObjects.Group | undefined;
            if (enemies) {
                this.weaponCollider = this.gameObject.scene.physics.add.overlap(this.weapon, enemies, (w, e) => {
                    console.log('[hitDirection] #####** ATTACK_DIRECTION inside--!', ATTACK_DIRECTION);

                    console.log('[boss] e', e);

                    console.log(
                        '[boss] (e as any).invulnerableComponent?.isInvulnerable',
                        (e as any).invulnerableComponent?.isInvulnerable,
                    );

                    if (!(e as any).invulnerableComponent?.isInvulnerable) {
                        (e as any).hit?.(1, ATTACK_DIRECTION);
                    }
                });
            }
        }

        // spiele Weapon-Animation (non-looping)
        this.weapon.play({ key: key?.anim ?? '', repeat: 0 }, true);
        this.gameObject.scene?.sound.play('SFX_SWORD_ATTACK', { seek: 1.75 });

        console.log('[hitDirection] #####** key.direction outside', key?.direction);
        console.log('[hitDirection] #####** ATTACK_DIRECTION outside', ATTACK_DIRECTION);

        this.weapon.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation: Phaser.Animations.Animation) => {
            console.log('***** Attack animation complete - unlocking movement', animation.key);

            if (
                animation.key === PlayerAnimation.ATTACK_DOWN ||
                animation.key === PlayerAnimation.ATTACK_UP ||
                animation.key === PlayerAnimation.ATTACK_LEFT ||
                animation.key === PlayerAnimation.ATTACK_RIGHT
            ) {
                BLOCK_ATTACK_MOVEMENT.blockAttackMovement = false;
            }
        });

        // hide + disable body wenn Animation fertig
        this.weapon.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim: Phaser.Animations.Animation) => {
            if (anim.key !== key?.anim) return;
            this.weapon.setVisible(false);
            if (wBody) {
                wBody.setVelocity(0, 0);
                wBody.setEnable(false);
            }
            // restore player visuals & animations
            player.setVisible(true);
            if (hadAnims) player.anims.resume(); // oder play Idle-Anim explizit

            this.gameObject.invulnerableComponent.invulnerable = false;

            this.stateMachine.setState(PlayerStates.IDLE, DIRECTION);
        });
    }
}

export default AttackState;
