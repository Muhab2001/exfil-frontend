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
    params: {id: `${props.user_id}`}
  });
  
  userModel.username = fetchedUser.data.username;
  userModel.password = fetchedUser.data.password;
  switch (RoleArray[fetchedUser.data.role]) {
      case Role.CUSTOMER:
        {
          fetchedUser = await AxiosInstance.get(`user/customer/${props.user_id}`, {
            params: {id: `${props.user_id}`},
          });
          userModel.phone = fetchedUser.data.phone;
          userModel.email = fetchedUser.data.email;
        }
      case Role.RETAIL_EMPLOYEE:
        {
          fetchedUser = await AxiosInstance.get(`user/retail-employee/${props.user_id}`, {
            params: {id: `${props.user_id}`},
          });
          userModel.phone = fetchedUser.data.company_phone;
          userModel.email = fetchedUser.data.company_email;
        }
      case Role.DELIVERY_EMPLOYEE:
        {
          fetchedUser = await AxiosInstance.get(`user/delivery-employee/${props.user_id}`, {
            params: {id: `${props.user_id}`}
          });
          userModel.phone = fetchedUser.data.company_phone;
          userModel.email = fetchedUser.data.company_email;
        }
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
  // * assuming all UserModals with mode == create are customers due to the lack of inputs in the form (salary, retail_center)
  let customerRoleNumber: number = -1;
  
  RoleArray.forEach((role:Role, index:number) => {
    if (role == Role.CUSTOMER) {
      customerRoleNumber = index
    }
  });

  const reqBody: { [key: string]: string | number} = {
    username: userModel.username,
    id: props.user_id,
    password: userModel.password,
    email: userModel.email,
    phone_number: userModel.phone,
  };
  if (props.mode === "create") {
    reqBody.role = customerRoleNumber;
    await AxiosInstance.post(`user`, {
      body: reqBody,
    });
  } else {
    switch (RoleArray[fetchedUser.data.role]) {
      case Role.CUSTOMER:
        {
          await AxiosInstance.patch(`user/customer/${props.user_id}`, {
            params: {id: `${props.user_id}`},
            body: reqBody,
          });
        }
      case Role.RETAIL_EMPLOYEE:
        {
          // I commented the next line to see if it is possible to send a request to "user/retail-employee/:id"
          // without the retail_center id in the body
          // reqBody.retail_center = fetchedUser.data.retail_center.id;
          await AxiosInstance.patch(`user/retail-employee/${props.user_id}`, {
            params: {id: `${props.user_id}`},
            body: reqBody,
          });
        }
      case Role.DELIVERY_EMPLOYEE:
        {
          await AxiosInstance.patch(`user/delivery-employee/${props.user_id}`, {
            params: {id: `${props.user_id}`},
            body: reqBody,
          });
        }
    }
  }
};
</script>

<style scoped></style>
