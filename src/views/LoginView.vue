<script setup lang="ts">
import { AxiosInstance } from "@/axios";
import { useAuth } from "@/stores/auth";
import { BoxMultiple24Filled } from "@vicons/fluent";
import axios from "axios";
import {
  type FormValidationError,
  NButton,
  NForm,
  NFormItem,
  NInput,
  useMessage,
  type FormInst,
  type FormRules,
  NIcon,
  NCollapseTransition,
} from "naive-ui";
import { computed, ref, type ComputedRef, watch } from "vue";
import { useRouter } from "vue-router";

// UI framwork logic
const formRef = ref<FormInst | null>(null);
const messenger = useMessage();
// router
const router = useRouter();
// authentication store
const auth = useAuth();

// interfaces
interface LoggingModel {
  username: string | null;
  password: string | null;
  id: string | null;
  email: string | null;
  phone: string | null;
  confirm_password: string | null;
}
// state
const model = ref<LoggingModel>({
  username: null,
  password: null,
  id: null,
  email: null,
  phone: null,
  confirm_password: null,
});

const rules: ComputedRef<FormRules> = computed(() => ({
  username: {
    required: true,
    message: "Please enter your name",
    trigger: ["blur", "input"],
  },
  password: {
    required: true,
    message: "Please enter your password",
    trigger: ["blur", "input"],
  },
  id: {
    required: formMode.value === "register",
    message: "Please enter your password",
    trigger: ["blur"],
  },
  email: {
    required: formMode.value === "register",
    message: "Please enter your email",
    trigger: ["blur"],
    type: "email",
  },
  phone: {
    required: formMode.value === "register",
    message: "Please enter your phone number",
    trigger: ["blur"],
  },
  confirm_password: {
    required: formMode.value === "register",
    message: "Please enter a matching confirmation password",
    trigger: ["blur"],
    validator(rule, value: string) {
      if (value !== model.value.password)
        return new Error("Please eter a matching confirmation password");
      if (!value) return new Error("Confrimation password is required");
      return true;
    },
  },
}));

const formMode = ref<"login" | "register">("login");

watch(formMode, () => {
  model.value = {
    username: null,
    password: null,
    id: null,
    email: null,
    phone: null,
    confirm_password: null,
  };
});
// handlers

const submitForm = () => {
  console.log(
    formMode.value,
    formMode.value === "login",
    formMode.value === "register"
  );

  if (formMode.value === "login") login();
  else if (formMode.value === "register") register();
};

const login = () => {
  formRef.value?.validate(
    async (errors: Array<FormValidationError> | undefined) => {
      if (!errors) {
        try {
          await auth.login(
            model.value.username?.trim()!,
            model.value.password!
          );
          messenger.success("Successful sign in!");
          router.push("/home");
        } catch (e: any) {
          messenger.error("Login Failed!");
        }
      } else {
        console.log(errors);
        messenger.error("Login Failed!");
      }
    }
  );
};

const register = () => {
  console.log("IN REGISTER");

  formRef.value?.validate(
    async (errors: Array<FormValidationError> | undefined) => {
      if (!errors) {
        try {
          await auth.register(
            model.value.username?.trim()!,
            model.value.password!,
            model.value.phone!,
            model.value.email!,
            model.value.id!
          );
          messenger.success("Successful Registration!");
          formMode.value = "login";
        } catch (e: any) {
          console.log(e);

          messenger.error("Registration Failed!");
        }
      } else {
        console.log(errors);
        messenger.error("Registration Failed!");
      }
    }
  );
};
</script>

<template>
  <main
    @keyup.enter.exact="submitForm"
    class="t-w-full t-flex t-flex-col t-items-center t-justify-center t-mb-10 t-h-full t-min-h-[90vh]"
  >
    <header class="t-flex-col t-items-center t-text-center">
      <h1
        class="t-font-sans t-font-bold t-m-auto t-text-[4rem] dark:t-text-white t-flex t-items-center"
      >
        <span>
          <NIcon
            size="60"
            class="t-mr-5 t-relative t-top-2"
            color="rgb(74 222 128)"
            :component="BoxMultiple24Filled"
        /></span>
        Exfil
      </h1>
      <p class="t-mb-10 dark:t-text-white">
        Packages everywhere, under a single platform
      </p>
    </header>
    <NForm
      class="t-w-[90vw] md:t-w-72 lg:t-w-80"
      ref="formRef"
      :label-width="80"
      :model="model"
      :rules="rules"
    >
      <NFormItem path="username" label="Username">
        <NInput
          type="text"
          v-model:value="model.username"
          @keydown.enter.prevent
        />
      </NFormItem>
      <NFormItem path="password" label="Password">
        <NInput
          type="password"
          show-password-on="mousedown"
          v-model:value="model.password"
          @keydown.enter.prevent
        />
      </NFormItem>
      <NCollapseTransition :show="formMode === 'login'">
        <NButton
          v-if="formMode === 'login'"
          secondary
          strong
          type="success"
          @click="submitForm"
          class="t-w-full hover:t-bg-green-500 hover:t-text-white t-mt-6"
        >
          Login</NButton
        >
        <div
          v-if="formMode === 'login'"
          class="t-mt-3 t-w-full t-flex t-justify-center t-items-center"
        >
          New Customer ?
          <NButton
            @click="formMode = 'register'"
            quaternary
            type="success"
            class="t-ml-1 t-p-1"
            >Register</NButton
          >
        </div>
      </NCollapseTransition>
      <NCollapseTransition :show="formMode === 'register'">
        <div v-if="formMode === 'register'">
          <NFormItem path="confirm_password" label="Password Confirmation">
            <NInput
              type="password"
              show-password-on="mousedown"
              v-model:value="model.confirm_password"
              @keydown.enter.prevent
            />
          </NFormItem>
          <NFormItem path="id" label="National ID">
            <NInput
              type="text"
              v-model:value="model.id"
              @keydown.enter.prevent
            />
          </NFormItem>
          <NFormItem path="email" label="Email">
            <NInput
              type="text"
              v-model:value="model.email"
              @keydown.enter.prevent
            />
          </NFormItem>
          <NFormItem path="phone" label="Phone Number">
            <NInput
              type="text"
              v-model:value="model.phone"
              @keydown.enter.prevent
            />
          </NFormItem>
          <NButton
            secondary
            strong
            type="success"
            @click="submitForm"
            class="t-w-full hover:t-bg-green-500 hover:t-text-white t-mt-6"
          >
            Register</NButton
          >
          <div class="t-mt-3 t-w-full t-flex t-justify-center t-items-center">
            You have an exiting account ?
            <NButton
              @click="formMode = 'login'"
              quaternary
              type="success"
              class="t-ml-1 t-p-1"
              >Register</NButton
            >
          </div>
        </div>
      </NCollapseTransition>
    </NForm>
  </main>
</template>
