<script setup>
  import { ref, shallowRef, computed, onMounted } from "vue";

  import Icon from "@/assets/icons/ico-hetong.svg";
  import anime from "animejs";

  const props = defineProps({
    radius: { type: Number, default: 120 }, // 外圆半径
    innerRadius: { type: Number, default: 60 }, // 内圆半径
    segmentAngle: { type: Number, default: 40 },
    segments: {
      type: Array,
      default: () => new Array(4).fill({ icon: Icon, label: "合同" })
    }, // 扇形角度
    gap: { type: Number, default: 8 }, // 间隔角度
    name: { type: [String, Array], default: () => ["项目", "中心"] },
    z: { type: Number, default: 9 }
  });

  defineEmits(["segment-tap"]);

  // svg 元素
  const assistiveTouchRef = ref(null);
  // 圆心坐标
  let assistiveTouchCenterCoords = shallowRef({ x: 0, y: 0 });
  const style = computed(() => ({
    transformOrigin: `${props.radius - 20}px ${props.radius}px`
  }));

  // 显示状态
  let visible = ref(false);

  // 计算扇形路径和文字/icon 位置
  const paths = shallowRef([]);

  // 扇形渲染起始角度 startAngel 取值范围 [-102.5, -102.5 + (props.segments.length-4) * props.segmentAngle]
  const initStartAngle = -102.5;
  const initEndAngle = -102.5 + (props.segments.length - 4) * props.segmentAngle;
  let startAngle = initStartAngle;
  let sealTimeStartAngle = initStartAngle;
  // 最大偏移角度
  let maxOffsetAngle = 0;
  // 当前拖动的角度变化
  let deltaAngle = 0;
  // 基于拖动角度的偏移
  let offsetAngle = 0;
  // 初始触摸角度
  let startTouchAngle = 0;

  // 角度转换为弧度
  const toRadians = (angle) => (angle * Math.PI) / 180;

  // 计算手指相对圆心角度
  const computedTouchAngle = (touch) => {
    // 计算触摸点到圆心的角度
    const dx = touch.clientX - assistiveTouchCenterCoords.value.x;
    const dy = touch.clientY - assistiveTouchCenterCoords.value.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI); // 计算角度

    return angle >= 0 ? angle : angle + 360; // 将负角度转换为正角度
  };

  // 渲染起始位置是否在区间中
  const isAngleInRange = () => {
    return !(sealTimeStartAngle <= initStartAngle || sealTimeStartAngle >= initEndAngle);
  };

  // 回弹的平滑效果
  const easeOut = (t) => {
    return 1 - Math.pow(1 - t, 3); // 使回弹速度逐渐减缓
  };

  // 事件结束初始化初始化状态
  const afterByTouchEnd = () => {
    startAngle = sealTimeStartAngle;
    deltaAngle = 0;
    maxOffsetAngle = 0;
  };

  /**
   * 回弹动画函数
   * @param config
   * isRebounding 是否处于回弹状态
   * reboundStartAngle 回弹开始的角度
   * reboundTargetAngle 回弹目标角度
   * reboundProgress 回弹进度（0到1之间）
   */
  const animateRebound = (config) => {
    let { isRebounding, reboundStartAngle, reboundTargetAngle, reboundProgress } = config;

    if (!isRebounding) return; // 如果没有进入回弹状态，则不继续动画

    reboundProgress += 0.05; // 控制回弹的速率
    if (reboundProgress >= 1) {
      reboundProgress = 1;
      isRebounding = false; // 回弹结束
    }

    if (Math.abs(reboundStartAngle) > 180) {
      reboundStartAngle =
        reboundStartAngle > 0 ? reboundTargetAngle - 180 : reboundTargetAngle + 180;
    }

    // 计算回弹的角度
    const easedProgress = easeOut(reboundProgress); // 使用缓动函数来平滑回弹
    deltaAngle = reboundStartAngle + (reboundTargetAngle - reboundStartAngle) * easedProgress; // 计算平滑的角度

    updatePaths(); // 更新路径

    if (isRebounding) {
      requestAnimationFrame(() =>
        animateRebound({ isRebounding, reboundStartAngle, reboundTargetAngle, reboundProgress })
      ); // 继续动画
    } else {
      sealTimeStartAngle =
        Math.abs(initStartAngle - sealTimeStartAngle) <= Math.abs(initEndAngle - sealTimeStartAngle)
          ? initStartAngle
          : initEndAngle;
      afterByTouchEnd();
    }
  };

  // 计算扇形路径和图标位置
  const updatePaths = () => {
    sealTimeStartAngle = startAngle + deltaAngle; // 基于拖动角度的偏移
    offsetAngle = sealTimeStartAngle;

    paths.value = props.segments.map((segment, index) => {
      const adjustedAngle = props.segmentAngle - props.gap;
      const endAngle = offsetAngle - adjustedAngle;

      // 计算扇形的中心角度
      const centerAngle = (offsetAngle + endAngle) / 2;
      const centerRadius = (props.radius + props.innerRadius) / 2; // 取扇形的中间位置

      // 计算 icon 和文字的中心点
      const centerX = props.radius + Math.cos(toRadians(centerAngle)) * centerRadius;
      const centerY = props.radius + Math.sin(toRadians(centerAngle)) * centerRadius;

      // 计算扇形路径
      const outerStartX = props.radius + Math.cos(toRadians(offsetAngle)) * props.radius;
      const outerStartY = props.radius + Math.sin(toRadians(offsetAngle)) * props.radius;
      const outerEndX = props.radius + Math.cos(toRadians(endAngle)) * props.radius;
      const outerEndY = props.radius + Math.sin(toRadians(endAngle)) * props.radius;

      const innerStartX = props.radius + Math.cos(toRadians(endAngle)) * props.innerRadius;
      const innerStartY = props.radius + Math.sin(toRadians(endAngle)) * props.innerRadius;
      const innerEndX = props.radius + Math.cos(toRadians(offsetAngle)) * props.innerRadius;
      const innerEndY = props.radius + Math.sin(toRadians(offsetAngle)) * props.innerRadius;

      const pathData = `
        M ${outerStartX} ${outerStartY}
        A ${props.radius} ${props.radius} 0 0 0 ${outerEndX} ${outerEndY}
        L ${innerStartX} ${innerStartY}
        A ${props.innerRadius} ${props.innerRadius} 0 0 1 ${innerEndX} ${innerEndY}
        Z
      `;

      offsetAngle -= props.segmentAngle; // 逆时针调整角度
      return {
        pathData,
        centerX,
        centerY,
        icon: segment.icon,
        label: segment.label,
        index
      };
    });
  };

  // 手指按下事件，记录初始角度
  const onTouchStart = (event) => {
    startTouchAngle = computedTouchAngle(event.touches[0]); // 获取初始触摸角度
  };
  // 手指移动事件，计算拖动角度
  const onTouchMove = (event) => {
    const currentTouchAngle = computedTouchAngle(event.touches[0]);

    const offsetAngle = currentTouchAngle - startTouchAngle;

    // 限制最大旋转角度
    if (isAngleInRange()) {
      deltaAngle = offsetAngle;
      maxOffsetAngle = Math.floor(offsetAngle);
    } else {
      deltaAngle = maxOffsetAngle + (offsetAngle - maxOffsetAngle) * 0.3;
    }
    updatePaths(); // 更新路径和图标位置
  };
  // 手指松开事件，结束拖动
  const onTouchEnd = () => {
    if (isAngleInRange()) {
      afterByTouchEnd();
    } else {
      // 启动回弹动画
      animateRebound({
        isRebounding: true,
        reboundStartAngle: deltaAngle,
        reboundTargetAngle: maxOffsetAngle,
        reboundProgress: 0
      });
    }
  };

  // 展开和收缩动画
  const animateExpandCollapse = (expand) => {
    visible.value = expand;
    anime({
      targets: ".segment-group", // 使用 class 选择路径元素
      duration: 500,
      easing: "easeInOutQuad",
      scale: expand ? [0, 1] : [1, 0], // 展开和收缩的缩放动画
      opacity: expand ? [0, 1] : [1, 0]
    });
  };

  onMounted(() => {
    const rect = assistiveTouchRef.value.getBoundingClientRect();
    assistiveTouchCenterCoords.value = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    updatePaths();
  });
</script>

<template>
  <svg
    ref="assistiveTouchRef"
    :width="radius * 2"
    :height="radius * 2"
    :style="`touch-action: none; z-index: ${z}`"
    class="fixed -right-26 bottom-1/3"
  >
    <defs>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="3" stdDeviation="12" flood-color="black" flood-opacity="0.2" />
      </filter>
      <filter id="path-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="black" flood-opacity="0.2" />
      </filter>
    </defs>
    <g
      v-for="(item, index) in paths"
      :key="index"
      :style="style"
      class="segment-group"
      @click="() => $emit('segment-tap', item)"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend.passive="onTouchEnd"
      @touchcancel.passive="onTouchEnd"
    >
      <!-- 画扇形 -->
      <path :d="item.pathData" class="fill-(--cm-primary-color)" filter="url(#path-shadow)" />
      <!-- 画 icon -->
      <image
        :x="item.centerX - 10"
        :y="item.centerY - 20"
        width="20"
        height="20"
        :href="item.icon"
      />
      <!-- 画文本 -->
      <text
        :x="item.centerX"
        :y="item.centerY + 12"
        fill="white"
        font-size="12"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {{ item.label }}
      </text>
    </g>

    <!-- 组1：包含第一个圆、文字和图标 -->
    <g @click="() => animateExpandCollapse(!visible)">
      <!-- 中心控制圆 -->
      <circle
        :cx="radius - 20"
        :cy="radius"
        r="24"
        class="fill-(--cm-primary-color)"
        filter="url(#shadow)"
      />

      <transition name="fade" mode="out-in">
        <!-- 画文本 -->
        <text
          v-if="!visible"
          :x="radius - 20"
          :y="radius"
          fill="white"
          font-size="13"
          font-weight="bold"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          <template v-if="name instanceof Array">
            <tspan
              v-for="(item, index) in name"
              :key="index"
              :x="radius - 20"
              :dy="(index === 0 ? -6 : 16) * (name.length === 2)"
            >
              {{ item }}
            </tspan>
          </template>
          <template v-else>
            {{ name }}
          </template>
        </text>

        <!-- 画 icon -->
        <image v-else :x="radius - 32" :y="radius - 12" width="24" height="24" :href="Icon" />
      </transition>
    </g>
  </svg>
</template>

<style lang="scss" scoped>
  .segment-group {
    transform: scale(0);
    cursor: pointer;
  }

  /* 定义过渡动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
</style>
