<template>
  <NModal
    :auto-focus="true"
    :on-esc-click="() => $emit('closed')"
    :mask-closable="false"
    :block-scroll="true"
    :trap-focus="true"
    :show="props.visible"
    title="New Order"
    transform-origin="center"
    content-style="padding-bottom: 0px"
    preset="card"
    class="t-w-full md:t-w-[80%] t-max-w-7xl"
    @close="() => $emit('closed')"
    size="large"
  >
    <NForm :model="modelRef" ref="formRef" :rules="formRules">
      <NFormItem path="username" label="Username">
        <NInput
          v-model:value="modelRef.username"
          max-length="30"
          show-count
          clearable
        />
      </NFormItem>
      <NFormItem path="email" label="Email">
        <NInput
          v-model:value="modelRef.email"
          max-length="30"
          show-count
          type="email"
          clearable
        />
      </NFormItem>
      <NFormItem path="phone" label="Phone number">
        <NInput
          v-model:value="modelRef.phone"
          max-length="30"
          show-count
          type="phone"
          clearable
        />
      </NFormItem>
      <NFormItem path="password" label="Password">
        <NInput
          v-model:value="modelRef.password"
          max-length="30"
          show-count
          type="password"
          clearable
        />
      </NFormItem>
    </NForm>
    <template #footer>
      <NButton @click="submitForm" class="t-mr-2" type="success"
        >Submit</NButton
      >
      <NButton @click="$emit('closed')" type="default">Cancel</NButton>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { NForm, NModal, type FormInst, type FormRules } from "naive-ui";
import { ref, watch } from "vue";

interface UserModalProps {
  user_id: number;
  visible: boolean;
  mode: "edit" | "create";
}

interface UserModel {
  username: string;
  email: string;
  password: string;
  phone: string;
}

const props = defineProps<UserModalProps>();
const emits = defineEmits<{ (E: "closed"): void }>();

const formRef = ref<FormInst | null>(null);
const modelRef = ref<UserModel>({
  username: "",
  email: "",
  password: "",
  phone: "",
});

const formRules: FormRules = {
  username: {
    required: true,
  },
  email: {
    required: true,
  },
  password: {
    required: true,
  },
  phone: {
    required: true,
  },
};

watch(
  () => props.visible,
  () => {
    if (props.visible) {
      if (props.mode === "create") {
        // empty all fields
      } else {
        // pre-fill all fields with passed data
      }
    }
  }
);

const submitForm = () => {};
</script>

<style scoped></style>
