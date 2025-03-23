<script setup>
  import { ref, computed } from "vue";

  const props = defineProps({
    radius: { type: Number, default: 180 }, // 外圆半径
    innerRadius: { type: Number, default: 100 }, // 内圆半径
    thickness: { type: Number, default: 20 }, // 扇形厚度
    segments: { type: Array, default: () => new Array(6).fill(40) }, // 扇形角度
    gap: { type: Number, default: 5 }, // 间隔角度
    icons: { type: Array, default: () => ["icon1.png", "icon2.png", "icon3.png", "icon4.png"] }, // 图标路径
    labels: { type: Array, default: () => ["A", "B", "C", "D"] } // 文字标签
  });

  const totalAngle = computed(() => {
    return props.segments.reduce((sum, s) => sum + s, 0);
  });

  // 计算扇形路径和文字/icon 位置
  const paths = ref([]);

  let isDragging = ref(false);

  // 记录顶部角度和底部角度

  let startAngle = ref(-180 + totalAngle.value / 2 - props.gap / 2); // 初始角度
  let startTouchAngle = ref(0); // 手指按下时的角度
  let deltaAngle = ref(0); // 当前拖动的角度变化

  // 计算扇形路径和图标位置
  const updatePaths = () => {
    let angleOffset = startAngle.value + deltaAngle.value; // 基于拖动角度的偏移

    paths.value = props.segments.map((segment, index) => {
      const adjustedAngle = segment - props.gap;
      const endAngle = angleOffset - adjustedAngle;

      // 计算扇形的中心角度
      const centerAngle = (angleOffset + endAngle) / 2;
      const centerRadius = (props.radius + props.innerRadius) / 2; // 取扇形的中间位置

      // 计算 icon 和文字的中心点
      const centerX = props.radius + Math.cos(toRadians(centerAngle)) * centerRadius;
      const centerY = props.radius + Math.sin(toRadians(centerAngle)) * centerRadius;

      // 计算扇形路径
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

      angleOffset -= segment; // 逆时针调整角度
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

  // 角度转换为弧度
  const toRadians = (angle) => (angle * Math.PI) / 180;

  // 手指按下事件，记录初始角度
  const onTouchStart = (event) => {
    isDragging.value = true;
    event.preventDefault(); // 禁止默认的滚动行为
    startTouchAngle.value = getTouchAngle(event); // 获取初始触摸角度
  };

  // 计算触摸角度并保证其平滑
  const getTouchAngle = (event) => {
    const touch = event.touches[0];
    const centerX = props.radius;
    const centerY = props.radius;
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    return (Math.atan2(dy, dx) * 180) / Math.PI; // 返回角度
  };

  let offsetAngle = 0;
  // 手指移动事件，计算拖动角度
  const onTouchMove = (event) => {
    if (!isDragging.value) return;
    event.preventDefault(); // 禁止默认的滚动行为
    let currentTouchAngle = getTouchAngle(event);

    // 处理跨越边界的情况，确保角度变化连续
    if (offsetAngle < 0 && currentTouchAngle > 90) {
      // 计算当前角度与起始角度之间的差值
      offsetAngle = -360 - startTouchAngle.value + currentTouchAngle;
    } else {
      // 计算当前角度与起始角度之间的差值
      offsetAngle = currentTouchAngle - startTouchAngle.value;
    }

    deltaAngle.value = offsetAngle;

    console.log(offsetAngle, currentTouchAngle, startTouchAngle.value);

    updatePaths(); // 更新路径和图标位置
  };

  // 回弹的平滑效果
  const easeOut = (t) => {
    return 1 - Math.pow(1 - t, 3); // 使回弹速度逐渐减缓
  };

  // 回弹状态
  let isRebounding = false; // 是否处于回弹状态
  let reboundStartAngle = 0; // 回弹开始的角度
  let reboundTargetAngle = 0; // 回弹目标角度
  let reboundProgress = 0; // 回弹进度（0到1之间）

  // 回弹动画函数
  const animateRebound = () => {
    if (!isRebounding) return; // 如果没有进入回弹状态，则不继续动画

    // 计算回弹进度，逐渐减缓
    reboundProgress += 0.05; // 控制回弹的速率
    if (reboundProgress >= 1) {
      reboundProgress = 1;
      isRebounding = false; // 回弹结束
    }
    // 处理跨越边界的情况，确保角度变化连续
    if (Math.abs(reboundStartAngle) > 180) {
      // 计算当前角度与起始角度之间的差值
      reboundStartAngle =
        reboundStartAngle > 0 ? reboundTargetAngle - 180 : reboundTargetAngle + 180;
    }

    // 计算回弹的角度
    const easedProgress = easeOut(reboundProgress); // 使用缓动函数来平滑回弹
    deltaAngle.value = reboundStartAngle + (reboundTargetAngle - reboundStartAngle) * easedProgress; // 计算平滑的角度

    updatePaths(); // 更新路径

    if (isRebounding) {
      requestAnimationFrame(animateRebound); // 继续动画
    }
  };

  // 手指松开事件，结束拖动
  const onTouchEnd = () => {
    isDragging.value = false;
    offsetAngle = 0;

    // 在松开时将角度恢复到初始位置
    reboundStartAngle = deltaAngle.value;
    reboundTargetAngle = 0; // 目标角度是0
    reboundProgress = 0; // 回弹进度重置
    isRebounding = true; // 开始回弹动画

    animateRebound(); // 启动回弹动画
  };

  updatePaths(); // 初始化路径和图标位置
</script>

<template>
  <svg :width="radius * 2" :height="radius * 2" style="touch-action: none">
    <!-- 为每个扇形、图标和文本添加一个 g 元素来组合 -->
    <g
      v-for="(item, index) in paths"
      :key="index"
      style="cursor: pointer"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
      <!-- 画扇形 -->
      <path :d="item.pathData" fill="blue" stroke="white" stroke-width="2" />
      <!-- 画 icon -->
      <image
        :x="item.centerX - 10"
        :y="item.centerY - 30"
        width="20"
        height="20"
        :href="item.icon"
      />
      <!-- 画文本 -->
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

    <!-- 中心控制圆 -->
    <circle :cx="radius" :cy="radius" r="40" fill="red" stroke="black" stroke-width="2" />
  </svg>
</template>
