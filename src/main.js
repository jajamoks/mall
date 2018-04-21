// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import vuex from 'vuex'
import VueLazyLoad from 'vue-lazyload'
import infiniteScroll from 'vue-infinite-scroll'
import {currency} from '@/util/currency'

Vue.use(vuex);
Vue.use(infiniteScroll);
Vue.use(VueLazyLoad,{
	loading: "/static/loading-svg/loading-bars.svg"
});
Vue.filter("currency", currency)
Vue.config.productionTip = false
/* eslint-disable no-new */
const store = new vuex.Store({
	state:{
		nickname: '',
		cartCount: 0
	},
	mutations:{
		updateUserInfo(state, nickname){
			state.nickname = nickname;
		},
		updateCartCount(state, cartCount){
			state.cartCount += cartCount;
		},
    initCartCount(state, cartCount){
      state.cartCount = cartCount;
    }
	}
});
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
