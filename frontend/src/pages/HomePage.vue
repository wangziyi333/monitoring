<template>
  <div class="storefront">
    <section class="storefront-hero">
      <div>
        <span class="eyebrow">夏季会员大促</span>
        <h1>把日常所需，<br /><em>买得更值得。</em></h1>
        <p>从居家好物到通勤搭配，这里用一个真实促销场景承载后续要学习的点击、曝光、错误、性能和转化埋点。</p>
        <button data-track="hero-shop-now" data-track-key="hero-shop-now" @click="trackShop">进入活动会场</button>
      </div>
      <div class="hero-art"><span>01</span><strong>限时<br />上新</strong><small>会员专享折扣进行中</small></div>
    </section>

    <section class="storefront-bar"><strong>满 299 元包邮</strong><span>30 天无忧退换</span><span>每周五上新会员专场</span></section>

    <section class="catalog-section">
      <div class="section-heading"><div><span class="eyebrow">本期主推</span><h2>当前热门商品</h2></div><span>共 {{ products.length }} 件</span></div>
      <div class="product-grid">
        <article
          v-for="product in products"
          :key="product.id"
          class="product-card"
          :data-exposure-id="`product-card-${product.id}`"
          :data-product-id="product.id"
          :data-product-name="product.name"
          :data-position="product.position"
        >
          <div class="product-image" :style="{ background: product.color }"><span>{{ product.category }}</span><strong>{{ product.mark }}</strong></div>
          <div class="product-info"><span class="product-category">{{ product.category }}</span><h3>{{ product.name }}</h3><p>{{ product.description }}</p><div class="product-bottom"><strong>¥{{ product.price }}</strong><button :data-track="`product-buy-${product.id}`" :data-track-key="`product-buy-${product.id}`" :data-product-id="product.id" :data-product-name="product.name" :data-position="product.position" @click="addToCart(product)">立即购买</button></div></div>
        </article>
      </div>
    </section>

    <p v-if="message" class="toast">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { trackEvent } from '../sdk'
import { MonitorEventDefinition } from '../sdk/types/events'

const PRODUCT_MODULE_ID = 'home-popular-products'

const message = ref('')
const products = [
  { id: 'desk-lamp', name: 'Halo 氛围台灯', category: '家居照明', description: '适合夜间阅读和桌面工作的柔和暖光。', price: 299, position: 1, mark: 'HALO', color: '#f5c9a9' },
  { id: 'tote-bag', name: 'Daily 通勤托特包', category: '出行配件', description: '容量充足，适合上班、出差和周末短途。', price: 199, position: 2, mark: 'CARRY', color: '#cbded4' },
  { id: 'ceramic-set', name: 'Morning 陶瓷早餐组', category: '餐厨家居', description: '三件套组合，让早晨的仪式感更完整。', price: 259, position: 3, mark: 'AM', color: '#d9d1c4' },
  { id: 'linen-shirt', name: 'Relaxed 亚麻衬衫', category: '服饰穿搭', description: '轻薄透气，适合夏季通勤与周末出游。', price: 369, position: 4, mark: 'LINEN', color: '#c5d8e7' },
]

const trackShop = () => {
  trackEvent(MonitorEventDefinition.Custom.ManualButtonClick, { label: 'hero_shop_now' })
}

const addToCart = (product: (typeof products)[number]) => {
  trackEvent(MonitorEventDefinition.Custom.AddToCart, {
    productId: product.id,
    productName: product.name,
    position: product.position,
    quantity: 1,
    moduleId: PRODUCT_MODULE_ID,
  })

  message.value = `${product.name} 已加入购物袋`
  window.setTimeout(() => { message.value = '' }, 2200)
}
</script>

<style scoped>
.storefront { display: grid; gap: 28px; }
.storefront-hero { min-height: 420px; display: grid; grid-template-columns: 1.35fr .65fr; align-items: center; gap: 28px; padding: 58px 64px; background: #dbe8ee; border-radius: 8px; overflow: hidden; }
.eyebrow { color: var(--accent); font-size: 12px; font-weight: 800; letter-spacing: .14em; }
h1 { margin: 14px 0; font-size: clamp(42px, 6vw, 76px); line-height: .98; letter-spacing: 0; }
h1 em { color: var(--accent); font-family: Georgia, serif; font-weight: 400; }
.storefront-hero p { max-width: 470px; color: #52646f; line-height: 1.6; }
.hero-art { min-height: 290px; display: flex; flex-direction: column; justify-content: space-between; padding: 28px; background: #f3ae78; color: #2a3136; border-radius: 6px; transform: rotate(2deg); }
.hero-art span { font-size: 14px; font-weight: 700; }.hero-art strong { font-size: 48px; line-height: .9; }.hero-art small { max-width: 130px; }
.storefront-bar { display: flex; justify-content: space-around; gap: 18px; padding: 16px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); color: var(--muted); font-size: 14px; }.storefront-bar strong { color: var(--text); }
.section-heading { display: flex; justify-content: space-between; align-items: end; margin-bottom: 16px; }.section-heading h2 { margin: 7px 0 0; font-size: 30px; }.section-heading > span { color: var(--muted); font-size: 14px; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }.product-card { background: var(--panel); border: 1px solid var(--line); border-radius: 7px; overflow: hidden; }.product-image { aspect-ratio: 1 / 1.05; display: flex; flex-direction: column; justify-content: space-between; padding: 16px; }.product-image span { font-size: 12px; }.product-image strong { font-size: 30px; letter-spacing: .04em; }.product-info { padding: 16px; }.product-category { color: var(--accent); font-size: 12px; font-weight: 700; }.product-info h3 { margin: 7px 0; }.product-info p { min-height: 42px; margin: 0 0 16px; color: var(--muted); font-size: 13px; line-height: 1.45; }.product-bottom { display: flex; justify-content: space-between; align-items: center; }.product-bottom button { padding: 8px 10px; font-size: 12px; }.toast { position: fixed; right: 24px; bottom: 24px; margin: 0; padding: 13px 16px; background: var(--navy); color: white; border-radius: 6px; box-shadow: var(--shadow); }
@media (max-width: 900px) { .storefront-hero { grid-template-columns: 1fr; padding: 36px 28px; }.hero-art { min-height: 180px; }.product-grid { grid-template-columns: repeat(2, 1fr); } }.storefront-bar { flex-wrap: wrap; }
@media (max-width: 520px) { .product-grid { grid-template-columns: 1fr; } }
</style>
