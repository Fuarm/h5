<script setup>
  import { ref, computed, watchEffect } from "vue";

  const props = defineProps({
    radius: { type: Number, default: 180 }, // 外圆半径
    innerRadius: { type: Number, default: 100 }, // 内圆半径
    thickness: { type: Number, default: 20 }, // 扇形厚度
    segments: { type: Array, default: () => [40, 40, 40, 40] }, // 扇形角度
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
  let startAngle = ref(-180 + totalAngle.value / 2 - props.gap / 2); // 初始角度
  let startTouchAngle = ref(0); // 手指按下时的角度
  let deltaAngle = ref(0); // 当前拖动的角度变化

  const minAngle = -30; // 最小角度限制，防止拖动过远
  const maxAngle = 30; // 最大角度限制，防止拖动过远

  // 计算扇形路径和图标位置
  const updatePaths = () => {
    let angleOffset = startAngle.value + deltaAngle.value; // 基于拖动角度的偏移

    // 限制拖动角度范围
    if (angleOffset < minAngle) {
      angleOffset = minAngle + (angleOffset - minAngle) * 0.3; // 回弹效果
    } else if (angleOffset > maxAngle) {
      angleOffset = maxAngle - (maxAngle - angleOffset) * 0.3; // 回弹效果
    }

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
    startAngle.value = startAngle.value + deltaAngle.value; // 保存当前角度
  };

  // 手指移动事件，计算拖动角度
  const onTouchMove = (event) => {
    if (!isDragging.value) return;
    event.preventDefault(); // 禁止默认的滚动行为
    const currentTouchAngle = getTouchAngle(event);
    deltaAngle.value = currentTouchAngle - startTouchAngle.value; // 计算拖动的角度差
    updatePaths(); // 更新路径和图标位置
  };

  // 手指松开事件，结束拖动
  const onTouchEnd = () => {
    isDragging.value = false;
    startAngle.value += deltaAngle.value; // 更新最终角度
    deltaAngle.value = 0; // 重置角度差

    // 在松开时应用回弹效果
    animateBackToCenter();
  };

  // 获取触摸角度
  const getTouchAngle = (event) => {
    const touch = event.touches[0];
    const centerX = props.radius;
    const centerY = props.radius;
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    return (Math.atan2(dy, dx) * 180) / Math.PI; // 计算触摸角度
  };

  // 回弹到初始位置的动画
  const animateBackToCenter = () => {
    let currentAngle = startAngle.value + deltaAngle.value;

    const step = () => {
      if (Math.abs(currentAngle) < 0.1) {
        currentAngle = 0; // 终止回弹
        updatePaths(); // 更新路径
        return;
      }

      currentAngle *= 0.9; // 每次迭代减少角度变化量
      deltaAngle.value = currentAngle;
      updatePaths(); // 更新路径

      requestAnimationFrame(step); // 递归调用
    };

    step(); // 启动回弹动画
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
