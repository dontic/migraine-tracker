import SideBarLayout from "@/layouts/SideBarLayout";
import UsernameForm from "@/components/settings/UsernameForm";
import NameForm from "@/components/settings/NameForm";
import PasswordForm from "@/components/settings/PasswordForm";

const Settings = () => {
  return (
    <SideBarLayout title="Settings">
      <div className="flex flex-col gap-6 p-6 overflow-y-auto w-full max-w-2xl mx-auto">
        <UsernameForm />
        <NameForm />
        <PasswordForm />
      </div>
    </SideBarLayout>
  );
};

export default Settings;
