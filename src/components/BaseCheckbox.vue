<template>
  <div class="field">
    <label class="checkbox">
      <input type="checkbox" v-model="model" :checked="value" />
      {{ label }}
    </label>
  </div>
</template>

<script>
export default {
  name: 'base-checkbox',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: Boolean,
      default: false
    },
    v: {
      type: Object,
      required: true
    }
  },
  computed: {
    model: {
      get() {
        return this.value;
      },
      set(value) {
        this.v.$touch();
        this.$emit('input', value);
      }
    }
  }
};
</script>
