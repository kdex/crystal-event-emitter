# crystal-event-emitter

[![travis](https://travis-ci.org/kdex/crystal-event-emitter.svg?branch=master)](https://travis-ci.org/kdex/crystal-event-emitter)
[![codecov](https://codecov.io/gh/kdex/crystal-event-emitter/branch/master/graph/badge.svg)](https://codecov.io/gh/kdex/crystal-event-emitter)
[![dependencies](https://david-dm.org/kdex/crystal-event-emitter/status.svg)](https://david-dm.org/kdex/crystal-event-emitter)
[![documentation](https://kdex.github.io/crystal-event-emitter/badge.svg)](https://kdex.github.io/crystal-event-emitter)

A small, modern base class for event emitters — no dependencies.
## Documentation
You can find a documentation [here](https://kdex.github.io/crystal-event-emitter).
## Examples
### Inferred listeners
```js
import EventEmitter from "crystal-event-emitter";
class Cat extends EventEmitter {
	constructor() {
		super({
			inferListeners: true
		});
	}
	onFeed() {
		console.log("More food, please!");
	}
}
const cat = new Cat();
cat.emit("feed"); // "More food, please!"
```
### Manual listeners
```js
import EventEmitter from "crystal-event-emitter";
class Cat extends EventEmitter {
	constructor() {
		super();
	}
	onFeed() {
		console.log("More food, please!");
	}
}
const cat = new Cat();
cat.on("feed", cat.onFeed);
cat.emit("feed"); // "More food, please!"
```