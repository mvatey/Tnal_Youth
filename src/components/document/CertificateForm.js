"use client";

import { FolderPlus, UploadCloud, ChevronDown } from "lucide-react";

export default function CertificateForm({ form, setForm, onSave, onClose }) {
  const colors = [
    "#12224c",
    "#8b5cf6",
    "#22c55e",
    "#ef4444",
    "#fde047",
    "#000000",
  ];

  return (
    <div className="w-full p-2">
      <h2
        className="
mb-1
text-lg
font-bold
text-[#4b3192]
"
      >
        ការបង្កើតឯកសារ
      </h2>

      <div
        className="
grid
grid-cols-[260px_1fr]
gap-10
"
      >
        {/* LEFT */}

        <div className="space-y-1">
          <Field label="ឈ្មោះឯកសារ *">
            <input
              value={form.title || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              placeholder="បញ្ចូលឈ្មោះឯកសារ"
              className="
h-9
w-full
rounded-lg
border
px-3
text-sm
outline-none
"
            />
          </Field>

          <SelectField
            label="សាខា"
            value={form.branch}
            options={["សាខាភ្នំពេញ", "សាខាសៀមរាប"]}
            onChange={(v) =>
              setForm({
                ...form,
                branch: v,
              })
            }
          />

          <SelectField
            label="ប្រភេទឯកសារ"
            value={form.type || "វិញ្ញាបនបត្រ"}
            options={["វិញ្ញាបនបត្រ", "ប័ណ្ណសមាជិក"]}
            onChange={(v) =>
              setForm({
                ...form,
                type: v,
              })
            }
          />

          <div>
            <label className="text-xs text-gray-600">ភេទ - ចំណូលចិត្ត</label>

            <div
              className="
mt-2
flex
gap-2
text-sm
"
            >
              <label className="flex gap-2 items-center">
                <input
                  type="radio"
                  checked={form.gender === "ប្រុស"}
                  onChange={() =>
                    setForm({
                      ...form,
                      gender: "ប្រុស",
                    })
                  }
                />
                ប្រុស
              </label>

              <label className="flex gap-2 items-center">
                <input
                  type="radio"
                  checked={form.gender === "ស្រី"}
                  onChange={() =>
                    setForm({
                      ...form,
                      gender: "ស្រី",
                    })
                  }
                />
                ស្រី
              </label>
            </div>
          </div>

          <SelectField
            label="សមាជិក"
            value={form.member || "ម៉ៅ សំណាង"}
            options={["ម៉ៅ សំណាង", "សុខ ចាន់"]}
            onChange={(v) =>
              setForm({
                ...form,
                member: v,
              })
            }
          />

          <Field label="សេចក្តីពិពណ៌នា">
            <textarea
              value={form.description || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              placeholder="បញ្ចូលសេចក្តីពិពណ៌នា"
              className="
h-[80px]
w-full
resize-none
rounded-lg
border
p-3
text-sm
"
            />
          </Field>

          <label
            className="
flex
h-[80px]
cursor-pointer
flex-col
items-center
justify-center
rounded-xl
border-2
border-dashed
border-[#7180a8]
text-gray-400
hover:bg-gray-50
"
          >
            <input hidden type="file" />

            <UploadCloud size={26} />

            <p
              className="
mt-2
text-xs
"
            >
              បញ្ចូលឯកសារ
            </p>

            <p
              className="
text-[10px]
"
            >
              PDF,JPG,PNG (5MB)
            </p>
          </label>
        </div>

        {/* RIGHT */}

        <div>
          <div
            className="
mb-4
grid
grid-cols-[160px_110px_1fr_130px]
gap-4
items-end
"
          >
            <SelectField
              label="ពុម្ពអក្សរ"
              value={form.font || "Kantumruy Pro"}
              options={["Kantumruy Pro", "Noto Sans"]}
              onChange={(v) =>
                setForm({
                  ...form,
                  font: v,
                })
              }
            />

            <SelectField
              label="ទំហំ"
              value={form.fontSize || "6px"}
              options={["6px", "8px", "10px"]}
              onChange={(v) =>
                setForm({
                  ...form,
                  fontSize: v,
                })
              }
            />

            <div>
              <label className="text-xs">ពណ៌</label>

              <div
                className="
mt-3
flex
gap-3
"
              >
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setForm({
                        ...form,
                        color,
                      })
                    }
                    className="
h-5
w-5
rounded-full
border
"
                    style={{
                      backgroundColor: color,
                    }}
                  />
                ))}
              </div>
            </div>

            <SelectField
              label="ភាសា"
              value={form.language || "ភាសាខ្មែរ"}
              options={["ភាសាខ្មែរ", "English"]}
              onChange={(v) =>
                setForm({
                  ...form,
                  language: v,
                })
              }
            />
          </div>

          {/* PREVIEW */}

          <div
            className="
h-[390px]
w-full
rounded-sm
border-[4px]
border-[#12224c]
bg-white
p-2
shadow-sm
"
          >
            <img
              src="/sss.jpg"
              className="
h-full
w-full
object-contain
"
            />
          </div>

          <div
            className="
mt-5
flex
gap-4
"
          >
            <button
              onClick={onClose}
              className="
h-9
w-[130px]
rounded-lg
border
text-sm
"
            >
              បោះបង់
            </button>

            <button
              onClick={onSave}
              className="
flex-1
h-9
rounded-lg
bg-[#4b3192]
text-white
text-sm
flex
items-center
justify-center
gap-2
"
            >
              <FolderPlus size={18} />
              បង្កើតឯកសារ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        className="
text-xs
text-gray-600
"
      >
        {label}
      </label>

      <div className="mt-1">{children}</div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label
        className="
text-xs
text-gray-600
"
      >
        {label}
      </label>

      <div className="relative mt-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
h-9
w-full
appearance-none
rounded-lg
border
px-3
pr-8
text-sm
outline-none
"
        >
          {options.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        <ChevronDown
          className="
absolute
right-3
top-3
h-4
w-4
text-gray-500
"
        />
      </div>
    </div>
  );
}
