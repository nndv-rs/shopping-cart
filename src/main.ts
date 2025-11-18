import { createApp, ref } from 'vue';
import App from './App.vue';
import Home from './pages/home/Home.vue';
import ProductList from './pages/product-list/ProductList.vue';
import Checkout from './pages/checkout/Checkout.vue';
import ProductDetails from './pages/product-details/ProductDetails.vue';

// List of pages / routes
const routes: Record<string, any> = {
	'/': Home,
	'/pages/product-list.html': ProductList,
	'/pages/checkout.html': Checkout,
	'/pages/product-details.html': ProductDetails,
};

const currentPath = ref(window.location.pathname || '/');

function getPathname(fullPath: string) {
	try {
		const url = new URL(fullPath, window.location.origin);
		return url.pathname;
	} catch {
		return fullPath.split('?')[0] || '/';
	}
}

function navigate(fullPath: string) {
	const pathname = getPathname(fullPath);
	if (pathname === currentPath.value) return;
	history.pushState({}, '', fullPath);
	currentPath.value = pathname;
}

window.addEventListener('popstate', () => {
	currentPath.value = window.location.pathname;
});

const app = createApp(App);

app.provide('router', {
	routes,
	currentPath,
	navigate,
});

app.mount('#app');