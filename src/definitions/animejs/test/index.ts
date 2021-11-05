import anime, { AnimeInstance } from "../index";

anime({
  targets: ".selector",
});

anime({
  targets: document.querySelector("p"),
});

anime({
  targets: document.querySelectorAll("p"),
});

interface CustomObj {
  charged: string;
  cycles: number;
}

let st: AnimeInstance = anime();

class AnimeParams<T> {}

let params: AnimeParams<CustomObj> = {
  targets: { charged: "100%", cycles: 130 },
};

anime<CustomObj>({
  targets: { charged: "100%", cycles: 130 },
});

anime({
  targets: [".el", document.querySelector("p")],
});

anime({
  targets: [],
  easing: "easeInBack",
  translateX: [0, 100],
  rotate: {
    value: 0,
    duration: 100,
  },
  direction: "normal",
  keyframes: [
    {
      translateX: 400,
      duration: 100,
    },
    {
      translateY: 400,
      duration: 100,
    },
  ],
  scale: [],
});

anime({
  targets: "",
  stagger: anime.stagger(100, { from: 10 }),
});

anime({
  targets: "",
  stagger: anime.stagger(100, { from: "first" }),
});

anime({
  targets: "",
  stagger: anime.stagger(100, { direction: "reverse" }),
});

anime({
  targets: ".staggering-axis-grid-demo .el",
  translateX: anime.stagger(10, { grid: [14, 5], from: "center", axis: "x" }),
  translateY: anime.stagger(10, { grid: [14, 5], from: "center", axis: "y" }),
  rotateZ: anime.stagger([0, 90], { grid: [14, 5], from: "center", axis: "x" }),
  delay: anime.stagger(200, { grid: [14, 5], from: "center" }),
  easing: "easeInOutQuad",
});

// Create a timeline with default parameters
var tl = anime.timeline({
  easing: "easeOutExpo",
  duration: 750,
});

tl.add({
  targets: ".offsets-demo .el.square",
  translateX: 250,
})
  .add(
    {
      targets: ".offsets-demo .el.circle",
      translateX: 250,
    },
    "-=600"
  ) // relative offset
  .add(
    {
      targets: ".offsets-demo .el.triangle",
      translateX: 250,
    },
    0
  ); // absolute offset

var tl = anime.timeline({
  targets: ".params-inheritance-demo .el",
  delay: function (el, i) {
    return i * 200;
  },
  duration: 500,
  easing: "easeOutExpo",
  direction: "alternate",
  loop: true,
});

tl.add({
  translateX: 250,
  // override the easing parameter
  easing: "spring",
})
  .add({
    opacity: 0.5,
    scale: 2,
  })
  .add({
    // override the targets parameter
    targets: ".params-inheritance-demo .el.triangle",
    rotate: 180,
  })
  .add({
    translateX: 0,
    scale: 1,
  });

tl.play();
tl.pause();

var animation = anime({
  targets: ".play-pause-demo .el",
});

animation.play();
animation.pause();

let updates = 0;

anime({
  targets: ".update-demo .el",
  translateX: 270,
  delay: 1000,
  direction: "alternate",
  loop: 3,
  easing: "easeInOutCirc",
  update: function (anim) {
    updates++;
    let progress = "progress : " + Math.round(anim.progress) + "%";
    console.log(progress);
  },
}).finished.then(logFinished);

anime();

function logFinished() {
  console.log("finished");
}

var path = anime.path(".motion-path-demo path");

anime({
  targets: ".motion-path-demo .el",
  translateX: path("x"),
  translateY: path("y"),
  rotate: path("angle"),
  easing: "linear",
  duration: 2000,
  loop: true,
});

anime({
  targets: ".morphing-demo .polymorph",
  points: [
    {
      value: [
        "70 24 119.574 60.369 100.145 117.631 50.855 101.631 3.426 54.369",
        "70 41 118.574 59.369 111.145 132.631 60.855 84.631 20.426 60.369",
      ],
    },
    {
      value: "70 6 119.574 60.369 100.145 117.631 39.855 117.631 55.426 68.369",
    },
    {
      value: "70 57 136.574 54.369 89.145 100.631 28.855 132.631 38.426 64.369",
    },
    {
      value: "70 24 119.574 60.369 100.145 117.631 50.855 101.631 3.426 54.369",
    },
  ],
  easing: "easeOutQuad",
  duration: 2000,
  loop: true,
});

anime({
  targets: ".line-drawing-demo .lines path",
  strokeDashoffset: [anime.setDashoffset, 0],
  easing: "easeInOutSine",
  duration: 1500,
  delay: function (el, i) {
    return i * 250;
  },
  direction: "alternate",
  loop: true,
});

anime({
  targets: ".custom-easing-demo .el",
  translateX: 270,
  direction: "alternate",
  loop: true,
  duration: 2000,
  easing: function (el, i, total) {
    return function (t) {
      return Math.pow(Math.sin(t * (i + 1)), total);
    };
  },
});
