"use client";

type ParentFormProps = {
  mode: "create" | "edit";
  disabled?: boolean;
  data?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    relationship?: string;
  };
};

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:px-3.5 sm:py-2.5";

const ParentForm = ({ mode, data, disabled = false }: ParentFormProps) => {
  return (
    <fieldset disabled={disabled} className="space-y-4 disabled:opacity-70 sm:space-y-5">
      {mode === "edit" && data?.id ? (
        <input type="hidden" name="id" value={String(data.id)} />
      ) : null}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
          <input
            name="firstName"
            defaultValue={data?.firstName ?? ""}
            className={input}
            placeholder="e.g. Grace"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
          <input
            name="lastName"
            defaultValue={data?.lastName ?? ""}
            className={input}
            placeholder="e.g. Okafor"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
          <input
            name="email"
            type="email"
            defaultValue={data?.email ?? ""}
            className={input}
            placeholder="parent@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
          <input
            name="phone"
            defaultValue={data?.phone ?? ""}
            className={input}
            placeholder="+234 801 234 5678"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Relationship</label>
        <input
          name="relationship"
          defaultValue={data?.relationship ?? ""}
          className={input}
          placeholder="Father, Mother, Guardian"
        />
      </div>
    </fieldset>
  );
};

export default ParentForm;
