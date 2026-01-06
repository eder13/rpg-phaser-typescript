import { Direction, DIRECTION } from './tiled/types';
import { CustomGameObject, Position } from './types';

export function exhaustiveGuard(_value: never): never {
    throw new Error(`Error! Reached forbidden guard function with unexpected value: ${JSON.stringify(_value)}`);
}

export function isCustomGameObject(object: any): object is CustomGameObject {
    return object && typeof object.enableObject === 'function' && typeof object.disableObject === 'function';
}

export function getDirectionOfObjectFromAnotherObject(object: Position, targetObject: Position): Direction {
    const dx = targetObject.x - object.x;
    const dy = targetObject.y - object.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const EPS = 1e-3; // Toleranz für nahezu gleiche Positionen

    // Wähle die Achse mit der größeren Distanz. Bei nahezu gleicher Distanz default zu horizontal.
    if (absDx < EPS && absDy < EPS) {
        return DIRECTION.LEFT; // beliebiger Default, passt an falls nötig
    }

    if (absDx >= absDy) {
        // horizontal dominant
        return dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
    }

    // vertical dominant
    return dy > 0 ? DIRECTION.DOWN : DIRECTION.UP;
}
