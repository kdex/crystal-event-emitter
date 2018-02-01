export const ANY = "*";
const EXTENSIONS = Symbol("[[Extensions]]");
const assertInstance = (unknown, constructor, details) => {
	if (unknown instanceof constructor) {
		return true;
	}
	else {
		throw new TypeError(`Expected argument to be an instance of \`${constructor.name}\`, but instead got ${`an instance of \`${unknown.constructor.name}\``}. ${details}`.trim());
	}
};
export class EventEmitter {
	constructor(options = {}) {
		assertInstance(options, Object);
		this[EXTENSIONS] = {
			options,
			events: new Map()
		};
	}
	addEventListener(event, callback) {
		assertInstance(callback, Function);
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
	once(event, callback) {
		assertInstance(callback, Function);
		callback[EXTENSIONS] = {
			once: true
		};
		this.addEventListener(event, callback);
	}
	removeEventListeners(event) {
		if (event) {
			/* Remove all event listeners for a given event */
			for (const [evt, callbacks] of this[EXTENSIONS].events) {
				for (const callback of callbacks) {
					if (event === evt) {
						this.removeEventListener(evt, callback);
					}
				}
			}
		}
		else {
			/* Remove all event listeners */
			for (const [event, callbacks] of this[EXTENSIONS].events) {
				for (const callback of callbacks) {
					if (event === ANY) {
						this[EXTENSIONS].events.delete(event);
					}
					else {
						this.removeEventListener(event, callback);
					}
				}
			}
		}
	}
	removeEventListener(event, callback) {
		if (event === ANY) {
			this.removeEventListeners();
			return this;
		}
		assertInstance(callback, Function, `No callback has been specified. If you'd like to remove all events of type ${event}, use removeEventListeners instead`);
		/* Retrieve the listeners for this event type */
		const callbacks = this[EXTENSIONS].events.get(event);
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
	emit(event, ...args) {
		if (event !== ANY) {
			this.emit(ANY, event, ...args);
		}
		let inferenceSuccessful = false;
		/* Handle inferred listeners first */
		if (this[EXTENSIONS].options.inferListeners && typeof event === "string") {
			let inferredListener = `on${event[0].toUpperCase()}${event.substr(1)}`;
			if (inferredListener === `on*`) {
				inferredListener = "onAny";
			}
			if (this[inferredListener] instanceof Function) {
				inferenceSuccessful = true;
				this[inferredListener](...args);
			}
		}
		const callbacks = this[EXTENSIONS].events.get(event);
		if (!callbacks || !callbacks.size) {
			return inferenceSuccessful;
		}
		for (const callback of callbacks) {
			callback(...args);
			if (callback[EXTENSIONS] && callback[EXTENSIONS].once) {
				this.removeEventListener(event, callback);
			}
		}
		return this;
	}
}
EventEmitter.prototype.on = EventEmitter.prototype.addEventListener;
EventEmitter.prototype.off = EventEmitter.prototype.removeEventListener;
export default EventEmitter;