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
      <NFormItem path="id" label="User National ID">
        <NInput
          v-model:value="userModel.id"
          max-length="30"
          show-count
          clearable
        />
      </NFormItem>
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
            class="t-w-full"
            v-model:value="userModel.role"
            :options="
              Object.values(DisplayRole).map((rl) => ({ label: rl, value: rl }))
            "
            :render-label="renderLabel"
            clearable
          />
        </NFormItem>

        <NCollapseTransition :show="userModel.role !== Role.CUSTOMER">
          <NFormItem
            v-if="userModel.role !== Role.CUSTOMER"
            path="salary"
            label="Salary"
          >
            <NInputNumber
              v-model:value="userModel.salary"
              :min="1"
              type="salary"
              clearable
            />
          </NFormItem>
        </NCollapseTransition>
      </template>
      <NCollapseTransition
        :show="
          userModel.role === Role.RETAIL_EMPLOYEE ||
          props.targetRole === Role.RETAIL_EMPLOYEE
        "
      >
        <NFormItem
          path="retail_center"
          label="Retail Center"
          feedback="Assign the retail employee to a retail center"
          class="t-my-5"
        >
          <NSelect
            v-model:value="userModel.retail_center"
            :min="1"
            :options="retailCenters"
            filterable
            clearable
          />
        </NFormItem>
      </NCollapseTransition>
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
import {
  DisplayRole,
  Role,
  RoleToEndpointMap,
  ValuetoRoleMap,
  RoleToValueMap,
} from "@/enums/roles";
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
  type SelectOption,
  NCollapseTransition,
} from "naive-ui";
import { reactive, ref, watch, type VNodeChild, h, onBeforeMount } from "vue";

interface UserModalProps {
  user_id?: string;
  visible: boolean;
  mode: "edit" | "create";
  targetRole: Role;
}

interface UserModel {
  id?: string;
  username: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  salary?: number;
  retail_center?: string;
}

// const modalState = reactive<{
//   secureEdit: boolean;
// }>({ secureEdit: false });

const props = defineProps<UserModalProps>();
const emits = defineEmits<{ (E: "closed"): void }>();
const auth = useAuth();

const loading = useLoadingBar();
const message = useMessage();

const retailCenters = ref<SelectOption[]>([]);

onBeforeMount(async () => {
  const response = (await AxiosInstance.get("retail-center")).data;
  retailCenters.value = response.map((rc: any) => ({
    label: `${rc.name} ${rc.address.country},${rc.address.city}  ${rc.address.street}-${rc.address.zipcode}`,
    value: rc.id,
  }));
});

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
  id: {
    required: props.mode === "create",
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
  retail_center: {
    required: userModel.value.role === Role.RETAIL_EMPLOYEE,
  },
  salary: {
    required: userModel.value.role === Role.CUSTOMER && props.mode === "create",
  },
});

const renderLabel = (option: SelectOption): VNodeChild => {
  return [
    h(
      "div",
      {
        class: "t-w-full t-mr-8",
        style: {
          width: "1000px important",
        },
      },
      {
        default: () => [option.label as string],
      }
    ),
  ];
};

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

  if (ValuetoRoleMap[fetchedUser.user.role] === Role.CUSTOMER) {
    console.log("Hi customer");

    // if customer;

    userModel.value.email = fetchedUser.email;
  } else if (fetchedUser.role !== Role.UNSET) {
    // if not unset aka if employee
    userModel.value.phone = fetchedUser.company_phone;
    userModel.value.email = fetchedUser.company_email;
    if (auth.userProfile.role === Role.ADMIN) {
      adminMode.targetId = fetchedUser.user.id;
    }

    console.log("HI", ValuetoRoleMap[fetchedUser.role], fetchedUser);
    if (ValuetoRoleMap[fetchedUser.user.role] === Role.RETAIL_EMPLOYEE) {
      userModel.value.retail_center = fetchedUser.retail_center.id;
    }

    console.log(userModel.value, fetchedUser.phone);
  }
  userModel.value.role = ValuetoRoleMap[fetchedUser.user.role];
  userModel.value.id = fetchedUser.userId;
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
        console.log("ROLES", userModel.value.role === Role.CUSTOMER);
      } else {
        // pre-fill all fields with passed data
        await fetchData();
        console.log(
          userModel.value.role === Role.RETAIL_EMPLOYEE ||
            props.targetRole === Role.RETAIL_EMPLOYEE,
          "FETCHED ROLE",
          userModel.value.role,
          "TARGET",
          props.targetRole,
          Role.RETAIL_EMPLOYEE
        );
      }
    }
  }
);

const submitForm = () => {
  loading.start();
  formRef.value?.validate(async (errors) => {
    try {
      if (props.mode === "create") {
        if (!errors) {
          const reqBody: any = {
            username: userModel.value.username,
            password: userModel.value.password,
            phone_number: userModel.value.phone,
            email: userModel.value.email,
            role: RoleToValueMap[userModel.value.role],
            id: userModel.value.id,
          };

          if (userModel.value.role !== Role.CUSTOMER) {
            reqBody["salary"] = userModel.value.salary;
          }
          if (userModel.value.role === Role.RETAIL_EMPLOYEE) {
            reqBody["retail_center"] = userModel.value.retail_center;
          }
          await AxiosInstance.post("user", reqBody);

          message.success("User created successfully");
          loading.finish();
          emits("closed");
        } else {
          message.error("User creation failed");
          loading.error();
        }
      } else if (props.mode === "edit") {
        if (!errors) {
          const reqBody: any = {
            username: userModel.value.username,

            phone_number: userModel.value.phone,
            email: userModel.value.email,
          };

          if (userModel.value.role === Role.RETAIL_EMPLOYEE) {
            reqBody["retail_center"] = userModel.value.retail_center;
          }

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
    } catch (e) {
      message.error("User Form Submission failed");
      loading.error();
    }
  });
};
</script>

<style scoped></style>
