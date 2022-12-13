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
    <NForm :model="userModel" ref="formRef" :rules="formRules">
      <NFormItem path="username" label="Username">
        <NInput
          v-model:value="userModel.username"
          max-length="30"
          show-count
          clearable
        />
      </NFormItem>
      <NFormItem path="email" label="Email">
        <NInput
          v-model:value="userModel.email"
          max-length="30"
          show-count
          type="email"
          clearable
        />
      </NFormItem>
      <NFormItem path="phone" label="Phone number">
        <NInput
          v-model:value="userModel.phone"
          max-length="30"
          show-count
          type="phone"
          clearable
        />
      </NFormItem>
      <NFormItem path="password" label="Password">
        <NInput
          v-model:value="userModel.password"
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
import { AxiosInstance } from "@/axios";
import { Role, RoleArray } from "@/enums/roles";
import type { AxiosResponse } from "axios";
import { NForm, NModal, type FormInst, type FormRules } from "naive-ui";
import { reactive, ref, watch } from "vue";

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

const formRef = ref<FormInst | null>(null);
const userModel = reactive<UserModel>({
  username: "",
  email: "",
  password: "",
  phone: "",
});

var fetchedUser: AxiosResponse<any,any>;

const fetchData = async () => {
  fetchedUser = await AxiosInstance.get(`user/${props.user_id}`, {
    params: `${props.user_id}`
  });
  
  userModel.username = fetchedUser.data.username;
  userModel.password = fetchedUser.data.password;
  if (RoleArray[fetchedUser.data.role] == Role.CUSTOMER) {
    // if customer
    userModel.phone = fetchedUser.data.phone;
    userModel.email = fetchedUser.data.email;
  }
  else {
    // if employee
    userModel.phone = fetchedUser.data.company_phone;
    userModel.email = fetchedUser.data.company_email;
  }
};

watch(
  () => props.visible,
  async () => {
    if (props.visible) {
      if (props.mode === "create") {
        // empty all fields
      } else {
        // pre-fill all fields with passed data
        fetchData();
      }
    }
  }
);

const submitForm = async () => {
  // * assuming all UserModals with mode == create are customers
  let customerRoleNumber: number = -1;
  
  RoleArray.forEach((role:Role, index:number) => {
    if (role == Role.CUSTOMER) {
      customerRoleNumber = index
    }
  });

  const reqBody = {
    username: userModel.username,
    id: props.user_id,
    password: userModel.password,
    role: customerRoleNumber,
    email: userModel.email,
    phone_number: userModel.phone,
  };
  if (props.mode === "create") {
    fetchedUser = await AxiosInstance.post(`user`, {
    body: JSON.stringify(reqBody),
  });
  } else {
    switch (RoleArray[fetchedUser.data.role]) {
      case Role.CUSTOMER:
        
      case Role.RETAIL_EMPLOYEE:

      case Role.DELIVERY_EMPLOYEE:

    }
  }
};
</script>

<style scoped></style>
