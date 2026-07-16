"use client";

import SaveButton from "@/components/forms/SaveButton";
import BoxFill from "@/components/forms/boxFill";
import FormDate from "@/components/forms/FormDate";

export default function FamilyPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-primary">
          ព័ត៌មានគ្រួសារ
        </h2>

        <div className="mt-6 grid grid-cols-3 gap-x-6 gap-y-6">
          <BoxFill
            label="ឈ្មោះ ប្ដី/ប្រពន្ធ (ខ្មែរ)"
            placeholder="បញ្ចូលឈ្មោះប្ដីប្រពន្ធជាភាសាខ្មែរ"
          />

          <BoxFill
            label="ឈ្មោះ ប្ដី/ប្រពន្ធ (ឡាតាំង)"
            placeholder="បញ្ចូលឈ្មោះជាភាសាឡាតាំង"
          />

          <BoxFill
            label="មុខរបរ ប្ដី/ប្រពន្ធ"
            placeholder="បញ្ចូល"
          />

          <FormDate
            label="ថ្ងៃខែឆ្នាំ កំណើត"
          />

          <div className="col-span-2">
            <BoxFill
              label="ទីកន្លែងកំណើត"
              placeholder="បញ្ចូលទីកន្លែង"
            />
          </div>

          <BoxFill
            label="ឈ្មោះ កូន (ខ្មែរ)"
            placeholder="បញ្ចូលឈ្មោះកូនជាភាសាខ្មែរ"
          />

          <BoxFill
            label="ឈ្មោះ កូន (ឡាតាំង)"
            placeholder="បញ្ចូលឈ្មោះកូនជាភាសាឡាតាំង"
          />

          <BoxFill
            label="មុខរបរកូន"
            placeholder="បញ្ចូល"
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              ស្ថានភាពកូន
            </label>

            <div className="flex gap-8 pt-2">
              <Radio name="childStatus" label="នៅរស់" />
              <Radio name="childStatus" label="ស្លាប់" />
            </div>
          </div>

          <div className="col-span-2">
            <BoxFill
              label="ទីកន្លែងកូន"
              placeholder="បញ្ចូលទីកន្លែង"
            />
          </div>

          <BoxFill
            label="ឈ្មោះ ម្តាយ (ខ្មែរ)"
            placeholder="បញ្ចូលឈ្មោះម្តាយ"
          />

          <BoxFill
            label="ឈ្មោះ ម្តាយ (ឡាតាំង)"
            placeholder="បញ្ចូលឈ្មោះម្តាយ"
          />

          <BoxFill
            label="មុខរបរម្តាយ"
            placeholder="បញ្ចូល"
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              ស្ថានភាពម្តាយ
            </label>

            <div className="flex gap-8 pt-2">
              <Radio name="motherStatus" label="នៅរស់" />
              <Radio name="motherStatus" label="ស្លាប់" />
            </div>
          </div>

          <div className="col-span-2">
            <BoxFill
              label="ទីកន្លែងម្តាយ"
              placeholder="បញ្ចូលទីកន្លែង"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton />
      </div>
    </div>
  );
}

function Radio({ name, label }) {
  return (
    <label className="flex items-center gap-3 text-sm text-text-primary">
      <input
        type="radio"
        name={name}
        className="h-5 w-5 accent-primary"
      />
      {label}
    </label>
  );
}