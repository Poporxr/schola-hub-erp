import UserAvatar from "@/components/UserAvatar";

const Page = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Parent Profile
          </p>
          <h1 className="text-2xl font-bold">Account Overview</h1>
          <p className="text-sm text-white/70">
            Parent and guardian information linked to active students.
          </p>
        </div>
        <div className="absolute right-4 top-4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute left-0 bottom-0 w-56 h-56 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 pt-10 pb-6">
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-6 mb-6">
            <div className="flex items-center gap-4">
              <UserAvatar
                src={undefined}
                alt="Parent"
                size={96}
                className="w-24 h-24 border-4 border-white bg-white shadow-sm"
              />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Parent Account
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Mr. Okafor Emmanuel Chukwuma
                </h2>
                <p className="text-sm text-slate-500">Primary guardian</p>
              </div>
            </div>
            <span className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-full">
              Verified Parent
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Personal Information
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Full Name
                    </label>
                    <p className="text-slate-900 font-medium">
                      Mr. Okafor Emmanuel Chukwuma
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Relationship
                    </label>
                    <p className="text-slate-900 font-medium">Father</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Email Address
                    </label>
                    <p className="text-slate-900 font-medium">
                      emmanuel.okafor@email.com
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Phone Number
                    </label>
                    <p className="text-slate-900 font-medium">+234 802 345 6789</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Alternative Phone
                    </label>
                    <p className="text-slate-900 font-medium">+234 803 456 7890</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Home Address
                    </label>
                    <p className="text-slate-900 font-medium">
                      23 Independence Layout, Enugu, Enugu State
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Emergency Contact
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Contact Name
                    </label>
                    <p className="text-slate-900 font-medium">Mrs. Okafor Ngozi</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Relationship
                    </label>
                    <p className="text-slate-900 font-medium">Mother</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase">
                      Phone Number
                    </label>
                    <p className="text-slate-900 font-medium">+234 805 678 9012</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Linked Students
              </h3>
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-white">
                      <UserAvatar
                        src={undefined}
                        alt="Student"
                        size={48}
                        className="w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        Okafor Chidinma
                      </h4>
                      <p className="text-xs text-slate-500">
                        JSS 2A - Admission No: JSS2A/2024/015
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Class:</span>
                      <span className="font-medium text-slate-900"> JSS 2A</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Status:</span>
                      <span className="font-medium text-emerald-600"> Active</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-white">
                      <UserAvatar
                        src={undefined}
                        alt="Student"
                        size={48}
                        className="w-full h-full"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        Okafor Chukwuemeka
                      </h4>
                      <p className="text-xs text-slate-500">
                        SS 1B - Admission No: SS1B/2024/022
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Class:</span>
                      <span className="font-medium text-slate-900"> SS 1B</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Status:</span>
                      <span className="font-medium text-emerald-600"> Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
