// Fade-in on scroll
const faders = document.querySelectorAll('section');

const appearOptions = {
  threshold: 0.2,
  rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll){
  entries.forEach(entry => {
    if(!entry.isIntersecting){
      return;
    } else {
      entry.target.classList.add('fade-in');
      appearOnScroll.unobserve(entry.target);
    }
  });
}, appearOptions);

faders.forEach(section => {
  appearOnScroll.observe(section);
});
