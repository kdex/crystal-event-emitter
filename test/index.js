import test from "ava";
import EventEmitter from "../src/index";
test.beforeEach(t => {
	/**
	* A Cat is an example `EventEmitter`
	*/
	class Cat extends EventEmitter {}
	/**
	* A ListenerCat infers the listeners from the `EventEmitter`
	*/
	class ListenerCat extends EventEmitter {
		/**
		* Constructs a new `ListerCat`
		*/
		constructor() {
			super({
				inferListeners: true
			});
		}
	}
	t.context.data = {
		cat: new Cat(),
		ListenerCat
	};
});
test("constructing event emitter without object works", t => {
	t.plan(1);
	new EventEmitter();
	t.pass();
});
test("constructing event emitter with non-object throws", t => {
	t.plan(1);
	t.throws(() => new EventEmitter(false));
});
test("emitting events generally works", t => {
	t.plan(1);
	const { cat } = t.context.data;
	cat.on("meow", () => {
		t.pass();
	});
	cat.emit("meow");
});
test("adding non-function listeners throws", t => {
	t.plan(1);
	const { cat } = t.context.data;
	t.throws(() => cat.on("meow", Math.PI));
});
test("removing non-existent events doesn't throw", t => {
	t.plan(4);
	const { cat } = t.context.data;
	const eat = () => {};
	const drink = () => {};
	/* Case 1: No callbacks registered */
	t.notThrows(() => cat.removeEventListener("hungry", eat));
	/* Case 2: Callbacks registered, but unable to remove */
	cat.on("hungry", eat);
	t.notThrows(() => cat.removeEventListener("hungry", drink));
	cat.on("hungry", drink);
	/* Case 3.a: Callbacks registered, and able to remove; event stays */
	t.notThrows(() => cat.removeEventListener("hungry", eat));
	/* Case 3.b: Callbacks registered, and able to remove; event disappears */
	t.notThrows(() => cat.removeEventListener("hungry", drink));
});
test("emitting unregistered events works", t => {
	t.plan(3);
	const { cat } = t.context.data;
	t.notThrows(() => cat.emit("meow"));
	t.notThrows(() => cat.emit("purr"));
	t.notThrows(() => cat.emit("eat"));
});
test("events can have meta information", t => {
	t.plan(1);
	const { cat } = t.context.data;
	cat.addEventListener("meow", (...args) => {
		t.deepEqual(args, [1, 2, 3]);
	});
	cat.emit("meow", 1, 2, 3);
});
test("events will fire more than once", t => {
	t.plan(2);
	const { cat } = t.context.data;
	const reaction = (...args) => {
		t.deepEqual(args, [1, 2, 3]);
	};
	cat.on("meow", reaction);
	cat.emit("meow", 1, 2, 3);
	cat.emit("meow", 1, 2, 3);
});
test("events can carry different meta information", t => {
	t.plan(4);
	const { cat } = t.context.data;
	const reaction = (...args) => {
		if (args.length === 1) {
			t.deepEqual(args, ["hello"]);
			t.pass();
		}
		else {
			t.deepEqual(args, [1, 2, 3]);
			t.pass();
		}
	};
	cat.on("meow", reaction);
	cat.emit("meow", 1, 2, 3);
	cat.emit("meow", "hello");
});
test("events can be removed specifically", t => {
	t.plan(1);
	const { cat } = t.context.data;
	const removeMe = () => {
		cat.removeEventListener("meow", removeMe);
		t.pass();
	};
	cat.on("meow", removeMe);
	cat.emit("meow", 1, 2, 3);
	cat.emit("meow", "hello");
});
test("removeEventListener throws if it's missing a callback", t => {
	t.plan(2);
	const { cat } = t.context.data;
	const removeMe = () => {
		t.throws(() => cat.off("meow"));
	};
	cat.on("meow", removeMe);
	cat.emit("meow", 1, 2, 3);
	cat.emit("meow", "hello");
});
test("removeEventListeners removes all specific event listeners", t => {
	t.plan(4);
	const { cat } = t.context.data;
	const eatCatFood = () => {
		t.pass();
	};
	const dance = () => {
		t.pass();
	};
	cat.on("meow", eatCatFood);
	cat.on("meow", dance);
	cat.on("purr", eatCatFood);
	cat.emit("meow");
	cat.emit("purr");
	cat.removeEventListeners("meow");
	cat.emit("meow");
	cat.emit("purr");
});
test("removeEventListeners removes all event listeners if nothing is specified", t => {
	t.plan(3);
	const { cat } = t.context.data;
	const eatCatFood = () => {
		t.pass();
	};
	const dance = () => {
		t.pass();
	};
	cat.on("meow", eatCatFood);
	cat.on("meow", dance);
	cat.on("purr", eatCatFood);
	cat.emit("meow");
	cat.emit("purr");
	cat.removeEventListeners();
	cat.emit("meow");
	cat.emit("purr");
});
test("the `*` event works", t => {
	t.plan(3);
	const { cat } = t.context.data;
	const eatCatFood = () => {
		t.pass();
	};
	const dance = () => {
		t.pass();
	};
	const sleep = () => {
		t.pass();
	};
	cat.on("meow", eatCatFood);
	cat.on("meow", dance);
	cat.on("*", sleep);
	cat.emit("meow");
});
test("the `*` event works with more than one listener", t => {
	t.plan(4);
	const { cat } = t.context.data;
	const eatCatFood = () => {
		t.pass();
	};
	const dance = () => {
		t.pass();
	};
	const sleep = () => {
		t.pass();
	};
	cat.on("meow", eatCatFood);
	cat.on("meow", dance);
	cat.on("*", sleep);
	cat.on("*", dance);
	cat.emit("meow");
});
test("the `*` event can be used to remove all event listeners", t => {
	t.plan(0);
	const { cat } = t.context.data;
	const eatCatFood = () => {
		t.pass();
	};
	const dance = () => {
		t.pass();
	};
	cat.on("meow", eatCatFood);
	cat.on("meow", dance);
	cat.on("*", dance);
	cat.removeEventListener("*");
	cat.emit("meow");
});
test("the `onAny` method provides the event name, any other method won't", t => {
	t.plan(3);
	const { ListenerCat } = t.context.data;
	class Cat extends ListenerCat {
		onAny(event, ...args) {
			t.is(event, "meow");
			t.deepEqual(args, [1, 2, 3]);
		}
		onMeow(...args) {
			t.deepEqual(args, [1, 2, 3]);
		}
	}
	const cat = new Cat();
	cat.emit("meow", 1, 2, 3);
});
test("inferred listeners work", t => {
	t.plan(1);
	const { ListenerCat } = t.context.data;
	class Cat extends ListenerCat {
		onMeow() {
			t.pass();
		}
	}
	const cat = new Cat();
	cat.emit("meow");
});
test("`once` generally works", t => {
	t.plan(1);
	const { cat } = t.context.data;
	const purr = () => t.pass();
	cat.once("meow", purr);
	cat.emit("meow");
	cat.emit("meow");
});
test("`once` works with `*`", t => {
	t.plan(1);
	const { cat } = t.context.data;
	const purr = () => t.pass();
	cat.once("*", purr);
	cat.emit("meow");
	cat.emit("meow");
});
test("`once` will remove the event listener even if the callback is registered via `on`", t => {
	t.plan(1);
	const { cat } = t.context.data;
	const purr = () => t.pass();
	cat.on("meow", purr);
	cat.once("*", purr);
	cat.on("meow", purr);
	cat.emit("meow");
	cat.emit("meow");
});
test("inferred listeners can't be removed", t => {
	t.plan(2);
	const { ListenerCat } = t.context.data;
	class Cat extends ListenerCat {
		onMeow() {
			t.pass();
		}
	}
	const cat = new Cat();
	cat.emit("meow");
	cat.removeEventListeners("meow");
	cat.emit("meow");
});
test("inferred listeners are covered by `*`", t => {
	t.plan(2);
	const { ListenerCat } = t.context.data;
	class Cat extends ListenerCat {
		onMeow() {
			t.pass();
		}
		onAny() {
			t.pass();
		}
	}
	const cat = new Cat();
	cat.emit("meow");
});
test("emitting `*` only causes `onAny` or `*` to be invoked", t => {
	t.plan(2);
	const { ListenerCat } = t.context.data;
	class Cat extends ListenerCat {
		onMeow() {
			t.fail();
		}
		onAny() {
			t.pass();
		}
	}
	const cat = new Cat();
	cat.on("food", () => t.fail());
	cat.on("*", () => t.pass());
	cat.emit("*");
});