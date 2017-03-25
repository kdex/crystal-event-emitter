import test from "ava";
import EventEmitter from "EventEmitter";
test.beforeEach(t => {
	class Cat extends EventEmitter {}
	t.context.data = {
		cat: new Cat()
	};
});
test("emitting events generally works", t => {
	t.plan(1);
	const { cat } = t.context.data;
	cat.on("meow", () => {
		t.pass();
	});
	cat.emit("meow");
});
test("events can have meta information", t => {
	t.plan(1);
	const { cat } = t.context.data;
	cat.on("meow", (...args) => {
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
		t.throws(() => cat.removeEventListener("meow"));
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
test("inferred listeners work", t => {
	t.plan(1);
	class ListenerCat extends EventEmitter {
		constructor() {
			super({
				inferListeners: true
			})
		}
		onMeow() {
			t.pass();
		}
	}
	const cat = new ListenerCat();
	cat.emit("meow");
});
test("inferred listeners can't be turned off", t => {
	t.plan(2);
	class ListenerCat extends EventEmitter {
		constructor() {
			super({
				inferListeners: true
			})
		}
		onMeow() {
			t.pass();
		}
	}
	const cat = new ListenerCat();
	cat.emit("meow");
	cat.removeEventListeners("meow");
	cat.emit("meow");
});
test("inferred listeners should be covered by `*`", t => {
	t.plan(2);
	class ListenerCat extends EventEmitter {
		constructor() {
			super({
				inferListeners: true
			})
		}
		onMeow() {
			t.pass();
		}
		onAny() {
			t.pass();
		}
	}
	const cat = new ListenerCat();
	cat.emit("meow");
});