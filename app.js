const sections = Array.from(document.querySelectorAll('section')).map(
  (item) => item.id
);
let activeScetion = sections[0];
const scrollDuration = 1100;
let scrolling = false;

const u = 'up';
const d = 'down';
const r = 'right';
const l = 'left';

const navLinks = document.querySelectorAll('nav a');

const getNextSection = (direction) => {
  if (direction === u) {
    if (sections.indexOf(activeScetion) === 0) {
      return activeScetion;
    } else {
      const index = sections.findIndex((item) => item === activeScetion);

      return sections[index - 1];
    }
  } else if (direction === d) {
    if (sections.indexOf(activeScetion) === sections.length - 1) {
      return activeScetion;
    } else {
      const index = sections.findIndex((item) => item === activeScetion);

      return sections[index + 1];
    }
  }
};

function swipedetect(el, callback) {
  var touchsurface = el,
    swipedir,
    startX,
    startY,
    distX,
    distY,
    threshold = 10, //required min distance traveled to be considered swipe
    restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime = 700, // maximum time allowed to travel that distance
    elapsedTime,
    startTime,
    handleswipe = callback || function (swipedir) {};

  touchsurface.addEventListener(
    'touchstart',
    function (e) {
      var touchobj = e.changedTouches[0];
      swipedir = 'none';
      dist = 0;
      startX = touchobj.pageX;
      startY = touchobj.pageY;
      startTime = new Date().getTime(); // record time when finger first makes contact with surface
    },
    { passive: false }
  );

  touchsurface.addEventListener(
    'touchmove',
    function (e) {
      e.preventDefault();
    },
    { passive: false }
  );

  touchsurface.addEventListener(
    'touchend',
    function (e) {
      var touchobj = e.changedTouches[0];
      distX = touchobj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
      distY = touchobj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
      elapsedTime = new Date().getTime() - startTime; // get time elapsed
      if (elapsedTime <= allowedTime) {
        // first condition for awipe met
        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
          // 2nd condition for horizontal swipe met
          swipedir = distX < 0 ? 'left' : 'right'; // if dist traveled is negative, it indicates left swipe
        } else if (
          Math.abs(distY) >= threshold &&
          Math.abs(distX) <= restraint
        ) {
          // 2nd condition for vertical swipe met
          swipedir = distY < 0 ? 'up' : 'down'; // if dist traveled is negative, it indicates up swipe
        }
      }
      handleswipe(swipedir);
    },
    { passive: false }
  );
}

const triggerScrollBasedOnMotion = (e) => {
  let direction;
  if (e.type === 'wheel') {
    direction = e.deltaY > 0 ? d : u;
  } else if (e.type === 'touchmove') {
    if (e.direction === 'up') {
      direction = d;
    } else if (e.direction === 'down') {
      direction = u;
    } else return;
  }

  const nextId = getNextSection(direction);

  smoothScroll(nextId);
};

const startScroll = (e) => {
  e.preventDefault();
  if (scrolling) return;
  triggerScrollBasedOnMotion(e);
};

const smoothScroll = (elemId) => {
  if (scrolling) return;
  activeScetion = elemId;
  scrolling = true;
  const elem = document.getElementById(elemId);

  let startTime;
  let startPoint;
  const startY = scrollY || pageYOffset;
  const scrollHeight = elem.offsetTop - startY;

  const easing = (x) => {
    const pow = Math.pow;

    return x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2;
  };

  const step = (timestamp) => {
    if (!startTime) {
      startTime = timestamp;
    }
    const currentPos = scrollY || pageYOffset;

    const ended =
      scrollHeight > 0
        ? currentPos - startY >= scrollHeight
        : currentPos - startY <= scrollHeight;

    if (!ended) {
      const val =
        scrollHeight * easing((timestamp - startTime) / scrollDuration) +
        startY;
      scrollTo(0, val);

      requestAnimationFrame(step);
    } else {
      scrolling = false;
    }
  };
  requestAnimationFrame(step);
};

const onNavLinkClick = (e) => {
  smoothScroll(e.target.dataset.id);
};

navLinks.forEach((a) => {
  a.addEventListener('click', onNavLinkClick);
});

document.body.addEventListener('wheel', startScroll, { passive: false });
swipedetect(document.body, (direction) => {
  triggerScrollBasedOnMotion({ type: 'touchmove', direction });
});
