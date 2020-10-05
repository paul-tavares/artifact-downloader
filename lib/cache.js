
const STATE = new WeakMap();

export class Cache {
    constructor(filePath) {
        STATE.set(this, {
            filePath,
            data: {}
        });
        // TODO: Load file in sync. Ignore errors if file does not exists
    }

    async load() {}

    put(key, value) {}

    get(key) {}

    del(key) {}

    async save() {}
}