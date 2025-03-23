<script setup>
  import { ref, computed, onMounted, onBeforeMount } from "vue";
  import anime from "animejs"; // 引入 anime.js

  const props = defineProps({
    radius: { type: Number, default: 180 },
    innerRadius: { type: Number, default: 100 },
    thickness: { type: Number, default: 20 },
    segments: { type: Array, default: () => [40, 40, 40, 40] },
    gap: { type: Number, default: 5 },
    icons: { type: Array, default: () => ["icon1.png", "icon2.png", "icon3.png", "icon4.png"] },
    labels: { type: Array, default: () => ["A", "B", "C", "D"] }
  });

  const totalAngle = computed(() => {
    return props.segments.reduce((sum, s) => sum + s, 0);
  });

  const paths = ref([]);
  let isDragging = ref(false);
  let startAngle = ref(-180 + totalAngle.value / 2 - props.gap / 2);
  let startTouchAngle = ref(0);
  let deltaAngle = ref(0);

  const minAngle = -180;
  const maxAngle = 180;

  // 计算扇形路径和图标位置
  const updatePaths = () => {
    let angleOffset = startAngle.value + deltaAngle.value;

    // 限制角度范围
    if (angleOffset < minAngle) {
      angleOffset = minAngle + (angleOffset - minAngle) * 0.3;
    } else if (angleOffset > maxAngle) {
      angleOffset = maxAngle - (maxAngle - angleOffset) * 0.3;
    }

    paths.value = props.segments.map((segment, index) => {
      const adjustedAngle = segment - props.gap;
      const endAngle = angleOffset - adjustedAngle;

      const centerAngle = (angleOffset + endAngle) / 2;
      const centerRadius = (props.radius + props.innerRadius) / 2;

      const centerX = props.radius + Math.cos(toRadians(centerAngle)) * centerRadius;
      const centerY = props.radius + Math.sin(toRadians(centerAngle)) * centerRadius;

      const outerStartX = props.radius + Math.cos(toRadians(angleOffset)) * props.radius;
      const outerStartY = props.radius + Math.sin(toRadians(angleOffset)) * props.radius;
      const outerEndX = props.radius + Math.cos(toRadians(endAngle)) * props.radius;
      const outerEndY = props.radius + Math.sin(toRadians(endAngle)) * props.radius;

      const innerStartX = props.radius + Math.cos(toRadians(endAngle)) * props.innerRadius;
      const innerStartY = props.radius + Math.sin(toRadians(endAngle)) * props.innerRadius;
      const innerEndX = props.radius + Math.cos(toRadians(angleOffset)) * props.innerRadius;
      const innerEndY = props.radius + Math.sin(toRadians(angleOffset)) * props.innerRadius;

      const pathData = `
        M ${outerStartX} ${outerStartY}
        A ${props.radius} ${props.radius} 0 0 0 ${outerEndX} ${outerEndY}
        L ${innerStartX} ${innerStartY}
        A ${props.innerRadius} ${props.innerRadius} 0 0 1 ${innerEndX} ${innerEndY}
        Z
      `;

      angleOffset -= segment;
      return {
        pathData,
        centerX,
        centerY,
        icon: props.icons[index],
        label: props.labels[index],
        index
      };
    });
  };

  const toRadians = (angle) => (angle * Math.PI) / 180;

  const onTouchStart = (event) => {
    isDragging.value = true;
    event.preventDefault();
    startTouchAngle.value = getTouchAngle(event);
    startAngle.value = startAngle.value + deltaAngle.value;
  };

  const onTouchMove = (event) => {
    if (!isDragging.value) return;
    event.preventDefault();
    const currentTouchAngle = getTouchAngle(event);
    deltaAngle.value = currentTouchAngle - startTouchAngle.value;
    updatePaths();
  };

  const onTouchEnd = () => {
    isDragging.value = false;
    startAngle.value += deltaAngle.value;
    deltaAngle.value = 0;
  };

  const getTouchAngle = (event) => {
    const touch = event.touches[0];
    const centerX = props.radius;
    const centerY = props.radius;
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  // 展开和收缩动画
  const animateExpandCollapse = (expand) => {
    // anime({
    //   targets: ".segment-path", // 使用 class 选择路径元素
    //   duration: 1000,
    //   easing: "easeInOutQuad",
    //   scale: expand ? [0, 1] : [1, 0], // 展开和收缩的缩放动画
    //   translateX: expand ? [0, props.radius / 4] : [props.radius / 4, 0], // 以圆心为基准，移动至圆心
    //   translateY: expand ? [0, props.radius / 4] : [props.radius / 4, 0], // 以圆心为基准，移动至圆心
    //   opacity: expand ? [0, 1] : [1, 0]
    // });
    anime({
      targets: ".segment-path", // 使用 class 选择路径元素
      duration: 1000,
      easing: "easeInOutQuad",
      scale: expand ? [0, 1] : [1, 0], // 展开和收缩的缩放动画
      opacity: expand ? [0, 1] : [1, 0]
    });
  };

  // 初始化路径
  updatePaths();

  // 用于页面挂载后应用动画
  onBeforeMount(() => {
    animateExpandCollapse(false); // 初始化时默认收缩
  });
</script>

<template>
  <div>
    <svg :width="radius * 2" :height="radius * 2" style="touch-action: none">
      <!-- 为每个扇形、图标和文本添加一个 g 元素来组合 -->
      <g
        v-for="(item, index) in paths"
        :key="index"
        class="segment-path"
        style="cursor: pointer"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
      >
        <path :d="item.pathData" fill="blue" stroke="white" stroke-width="2" />
        <image
          :x="item.centerX - 10"
          :y="item.centerY - 30"
          width="20"
          height="20"
          :href="item.icon"
        />
        <text
          :x="item.centerX"
          :y="item.centerY + 10"
          fill="white"
          font-size="16"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ item.label }}
        </text>
      </g>

      <circle :cx="radius" :cy="radius" r="40" fill="red" stroke="black" stroke-width="2" />
    </svg>

    <!-- 控制展开和收缩的按钮 -->
    <button @click="animateExpandCollapse(true)">展开</button>
    <button @click="animateExpandCollapse(false)">收缩</button>
  </div>
</template>

<style>
  .segment-path {
    transform-origin: 180px 180px;
    transform: scale(0);
  }
</style>
