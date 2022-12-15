<template>
  <NModal
    :auto-focus="true"
    :on-esc-click="() => $emit('closed')"
    :mask-closable="false"
    :block-scroll="true"
    :trap-focus="true"
    :show="props.visible"
    title="Edit My Profile"
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
          type="text"
          clearable
        />
      </NFormItem>
      <NFormItem path="phone" label="Phone number">
        <NInput
          v-model:value="userModel.phone"
          max-length="30"
          show-count
          type="text"
          clearable
        />
      </NFormItem>
      <NFormItem
        v-if="props.mode === 'create' && auth.userProfile.role === Role.ADMIN"
        path="password"
        label="Password"
      >
        <NInput
          v-model:value="userModel.password"
          max-length="30"
          show-count
          type="password"
          clearable
        />
      </NFormItem>
      <template
        v-if="props.mode === 'create' && auth.userProfile.role === Role.ADMIN"
      >
        <NFormItem path="role" label="User Role">
          <NSelect
            v-model:value="userModel.role"
            :options="
              Object.values(Role).map((rl) => ({ label: rl, value: rl }))
            "
            clearable
          />
        </NFormItem>
        <NFormItem path="salary" label="Salary">
          <NInputNumber
            v-model:value="userModel.salary"
            :min="1"
            type="salary"
            clearable
          />
        </NFormItem>
      </template>
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
import { Role, RoleToEndpointMap, ValuetoRoleMap } from "@/enums/roles";
import { useAuth } from "@/stores/auth";
import {
  NForm,
  NModal,
  NFormItem,
  NInput,
  NButton,
  NSelect,
  type FormInst,
  type FormRules,
  useMessage,
  useLoadingBar,
  NInputNumber,
} from "naive-ui";
import { reactive, ref, watch, type Ref } from "vue";

interface UserModalProps {
  user_id?: number;
  visible: boolean;
  mode: "edit" | "create";
  targetRole: Role;
}

interface UserModel {
  username: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  salary?: number;
}

const modalState = reactive<{
  secureEdit: boolean;
}>({ secureEdit: false });

const props = defineProps<UserModalProps>();
const emits = defineEmits<{ (E: "closed"): void }>();
const auth = useAuth();

const loading = useLoadingBar();
const message = useMessage();

const formRef = ref<FormInst | null>(null);
const userModel = ref<UserModel>({
  username: "",
  email: "",
  password: "",
  phone: "",
  role: Role.CUSTOMER,
});

const formRules = reactive<FormRules>({
  username: {
    required: true,
  },
  email: {
    required: true,
  },
  password: {
    required: props.mode === "create",
  },
  phone: {
    required: true,
  },
  role: {
    required: props.mode === "create",
  },
  salary: {
    required:
      userModel.value.role !== Role.CUSTOMER &&
      props.mode === "create" &&
      auth.userProfile.role === Role.ADMIN,
  },
});

const adminMode = reactive<{ targetId?: string }>({
  targetId: "",
});

const fetchData = async () => {
  let fetchedUser: any = {};
  if (auth.userProfile.role === Role.ADMIN) {
    fetchedUser = (
      await AxiosInstance.get(
        `user/${RoleToEndpointMap[props.targetRole]}/${props.user_id}`
      )
    ).data;
  } else {
    fetchedUser = (
      await AxiosInstance.get(
        `user/${RoleToEndpointMap[props.targetRole]}/${auth.userProfile.id}`
      )
    ).data;
  }

  userModel.value.username = fetchedUser.user.username;
  console.log(
    fetchedUser.user.role,
    Role.CUSTOMER,
    fetchedUser.role === Role.CUSTOMER,
    fetchedUser.role == Role.CUSTOMER
  );

  if (ValuetoRoleMap[fetchedUser.user.role] === Role.CUSTOMER) {
    console.log("Hi customer");

    // if customer
    userModel.value.phone = fetchedUser.phone;
    userModel.value.email = fetchedUser.email;
  } else if (fetchedUser.role != Role.UNSET) {
    // if not unset aka if employee
    userModel.value.phone = fetchedUser.company_phone;
    userModel.value.email = fetchedUser.company_email;
    if (auth.userProfile.role === Role.ADMIN) {
      adminMode.targetId = fetchedUser.user.id;
    }

    console.log(userModel.value, fetchedUser.phone);
  }
};

watch(
  () => props.visible,
  async () => {
    if (props.visible) {
      if (props.mode === "create") {
        // empty all fields
        userModel.value = {
          username: "",
          email: "",
          password: "",
          phone: "",
          role: Role.CUSTOMER,
        };
      } else {
        // pre-fill all fields with passed data
        await fetchData();
      }
    }
  }
);

const submitForm = () => {
  loading.start();
  formRef.value?.validate(async (errors) => {
    if (props.mode === "create") {
      if (!errors) {
        await AxiosInstance.post("user", {
          username: userModel.value.username,
          password: userModel.value.password,
          phone: userModel.value.phone,
          email: userModel.value.email,
          role: userModel.value.role,
        });
        loading.finish();
      } else {
        message.error("User creation failed");
        loading.error();
        emits("closed");
      }
    } else if (props.mode === "edit") {
      if (!errors) {
        const reqBody: any = {
          username: userModel.value.username,

          phone: userModel.value.phone,
          email: userModel.value.email,
        };

        // only admins can change the salary
        if (auth.userProfile.role === Role.ADMIN) {
          reqBody["salary"] = userModel.value.salary;

          await AxiosInstance.patch(
            "user/" +
              RoleToEndpointMap[userModel.value.role] +
              "/" +
              adminMode.targetId,
            reqBody
          );
        } else {
          await AxiosInstance.patch(
            "user/" +
              RoleToEndpointMap[userModel.value.role] +
              "/" +
              auth.userProfile.id,
            reqBody
          );
        }
        message.success("User edit succsessful");
        loading.finish();
        emits("closed");
      } else {
        message.error("User Edit failed");
        loading.error();
      }
    }
  });
};
</script>

<style scoped></style>
