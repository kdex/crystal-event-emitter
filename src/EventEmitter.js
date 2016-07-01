export const ANY = Symbol("Any event");
const EXTENSIONS = Symbol("[[Extensions]]");
export class EventEmitter {
	constructor(options = {}) {
		if (!(options instanceof Object)) {
			throw new TypeError();
		}
		this[EXTENSIONS] = {
			options,
			events: new Map()
		};
	}
	addEventListener(event, callback) {
		if (callback instanceof Function) {
			/* Retrieve the listeners for this event type */
			let callbacks = this[EXTENSIONS].events.get(event);
			/* Add a new set if necessary */
			if (!callbacks || !callbacks.size) {
				callbacks = new Set();
				this[EXTENSIONS].events.set(event, callbacks);
			}
			/* Add a callback if necessary */
			if (!callbacks.has(callback)) {
				callbacks.add(callback);
			}
			return this;
		}
		else {
			throw new TypeError();
		}
	}
	removeEventListener(event, callback) {
		if (callback instanceof Function) {
			/* Retrieve the listeners for this event type */
			let callbacks = this[EXTENSIONS].events.get(event);
			/* If no callbacks are registered, ignore */
			if (!callbacks) {
				return this;
			}
			/* Remove the callback if necessary */
			if (callbacks.has(callback)) {
				callbacks.delete(callback);
			}
			/* Remove the event if necessary */
			if (!callbacks.size) {
				this[EXTENSIONS].events.delete(event);
			}
			return this;
		}
		else {
			if (event && event !== ANY && !(callback instanceof Function)) {
				/* Remove all event listeners for a given event */
				for (const [evt, callbacks] of this[EXTENSIONS].events) {
					for (const callback of callbacks) {
						if (event === evt) {
							this.removeEventListener(evt, callback);
						}
					}
				}
			}
			else if (event === ANY) {
				/* Remove all event listeners */
				for (const [event, callbacks] of this[EXTENSIONS].events) {
					for (const callback of callbacks) {
						if (event !== ANY) {
							this.removeEventListener(event, callback);
						}
						else {
							this[EXTENSIONS].events.delete(event);
						}
					}
				}
			}
			else {
				throw new TypeError();
			}
		}
	}
	emit(event, ...args) {
		if (event !== ANY) {
			this.emit(ANY, ...args);
		}
		let inferenceSuccessful = false;
		/* Handle inferred listeners first */
		if (this[EXTENSIONS].options.inferListeners && typeof event === "string") {
			const inferredListener = `on${event[0].toUpperCase()}${event.substr(1)}`;
			if (this[inferredListener] instanceof Function) {
				inferenceSuccessful = true;
				this[inferredListener].apply(this, args);
			}
		}
		const callbacks = this[EXTENSIONS].events.get(event);
		if (!callbacks || !callbacks.size) {
			return inferenceSuccessful;
		}
		for (const callback of callbacks) {
			callback.apply(null, args);
		}
		return this;
	}
}
EventEmitter.prototype.on = EventEmitter.prototype.addEventListener;
EventEmitter.prototype.off = EventEmitter.prototype.removeEventListener;
export default EventEmitter;