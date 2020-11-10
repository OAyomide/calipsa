import Vue from 'vue'
import App from './App'
import router from './router'
import VueCookies from 'vue-cookies'
import VueToast from 'vue-toast-notification'
import VuejsDialog from 'vuejs-dialog'
import 'vuejs-dialog/dist/vuejs-dialog.min.css';

import 'vue-toast-notification/dist/theme-default.css';
Vue.config.productionTip = false
Vue.use(VueCookies)
Vue.use(VueToast)
Vue.use(VuejsDialog)


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
