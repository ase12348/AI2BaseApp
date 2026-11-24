<template>
  <view class="page padding bg-white" style="box-sizing: border-box">
    <view>
      <view style="text-align: center">
        {{ $t('关注极简搭微信公众号') }}
        <br />
        {{ $t('获取更多框架信息') }}
      </view>
      <view style="text-align: center" class="margin-tb"
        ><image mode="aspectFill" src="/static/wx-qrcode.png"
      /></view>
    </view>
    <view class="content">
      <text>
        苏州极简搭信息技术有限公司是一家专业从事开发框架研发及企业应用系统开发的高新技术企业，公司核心团队由多名资深前端工程师、美工、资深架构师、资深APP开发工程师，知名企业IT管理人员组成，
        他们对企业信息化建设有着丰富的经验及创新意识。
        公司为客户提供集管理咨询、软件开发、系统维护为一体的综合性服务。
        公司自主创新产品--极简搭AI应用开发基座使用了当前主流的应用开发技术，及众多客户软件开发实践的成功经验。
        框架内置工作流、
        向导式智能开发组件、即时通讯组件、APP开发组件、微信组件、通用权限等一系列组件，软件开发人员通过一系列配置就可以快速构建高质量的信息系统。
        该产品投入使用能帮您大大降低软件研发成本，提高软件质量，从而提高产品竞争力，助力企业发展。
      </text>
    </view>
  </view>
</template>

<script setup>
import { $t } from '@/utils/index';
</script>

<style lang="scss" scoped>
image {
  width: 120px;
  height: 120px;
}
.content {
  font-size: 16px;
}
</style>
