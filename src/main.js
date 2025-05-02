import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './pages/Home.vue'
import Blog from './pages/Blog.vue'
import { nextTick } from 'vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/blog',
    name: 'Blog',
    component: Blog
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.hash) {
      return new Promise((resolve) => {
        const scrollOptions = {
          el: to.hash,
          behavior: from.name === to.name ? 'smooth' : 'instant' // smooth if on same page, instant if navigating
        };

        // this is the vue event-based implementation
        let numChecks = 0;
        let pageLoadStartTime = new Date();
        let maxLoadTimeInMs = 3000;
        let idName = to.hash.split('#').at(-1);

        const scrollThere = (newOpts) => {
          resolve(newOpts || scrollOptions);
          console.log("iterations:", numChecks);
        }

        const checkIsCreated = () => {
          numChecks++;

          if ((new Date()) - pageLoadStartTime >= maxLoadTimeInMs) {
            scrollThere();
            return;
          }
          // const foundElement = document.getElementById(idName);
          const foundElement = document.querySelector(to.hash);
          // console.log("found:", idName, foundElement, numChecks);
          if (!foundElement) nextTick(() => checkIsCreated());
          else scrollThere();
        }
        

        const maxDuration = 500; // 0.5 second timeout

        const checkElementRecursively = (timestamp) => {
          numChecks++;
          const element = document.querySelector(to.hash);
          // console.log("checkElementRecursively element:", element, numChecks++);
          if (element) {
            // Found the element, scroll to it
            scrollThere();
            return;
          }

          if (!checkElementRecursively.startTime) {
            checkElementRecursively.startTime = timestamp;
          }

          if (timestamp - checkElementRecursively.startTime < maxDuration) {
            // Still within time limit, schedule next check
            requestAnimationFrame(checkElementRecursively);
          } else {
            // Timeout reached, scroll to top
            scrollThere({top: 0});
          }
        };

        // First wait for Vue's DOM updates, then start checking
        nextTick(() => {
          // checkIsCreated(to.hash);
          requestAnimationFrame(checkElementRecursively);
        });
      });
    }
    return { top: 0 };
  }
});

const app = createApp(App)
app.use(router)
app.mount('#app')