<template>
  <NDropdown :options="profileOptions" @select="handleSelect">
    <span
      class="t-inline-flex t-flex-row t-p-4 t-text-slate-700 t-items-center t-w-fit dark:t-text-white"
    >
      <UserModal
        mode="edit"
        :target-role="auth.userProfile.role"
        @closed="userModal.visible = false"
        :visible="userModal.visible"
      />
      <div>
        <span class="t-mx-3 t-hidden md:t-flex t-font-bold t-text-sm">{{
          props.username
        }}</span>
      </div>
    </span>
  </NDropdown>
</template>
<script setup lang="ts">
import { NAvatar, NDropdown, type DropdownOption } from "naive-ui";
import { reactive, watchEffect, watch } from "vue";
import {
  PersonCircleOutline as UserIcon,
  LogOutOutline as LogoutIcon,
} from "@vicons/ionicons5";
import router from "@/router";
import { useIcon } from "@/composables/useIcon";
import { useAuth } from "@/stores/auth";
import { Role } from "@/enums/roles";
import UserModal from "./UserModal.vue";
const iconUtils = useIcon();
const auth = useAuth();

const handleSelect = (key: string) => {
  if (key === "SignOut") {
    console.log();

    auth.logout();
    router.push("/");
  }
};

const userModal = reactive<{ visible: boolean }>({ visible: false });
watch(
  () => userModal,
  () => {
    console.log(userModal.visible);
  }
);

const profileOptions: DropdownOption[] = [
  {
    label: "Sign out",
    key: "SignOut",
    props: {
      style: "color: red",
    },
    icon: iconUtils.renderIcon(LogoutIcon, { color: "red", size: "15px" }),
  },
];
console.log(auth.userProfile.role, Role.ADMIN);

watchEffect(() => {
  console.log("IN WATCH");

  if (auth.userProfile.role !== Role.ADMIN && profileOptions.length !== 2) {
    console.log("Not for admins!");

    profileOptions.unshift({
      label: "Update Profile",
      key: "editPic",
      icon: iconUtils.renderIcon(UserIcon),
      props: {
        onClick: () => {
          userModal.visible = true;
        },
      },
    });
  }
});
const props = defineProps<{
  username: string;
  role: Role;
}>();

console.log("PROFILE", props);
</script>
<style></style>
