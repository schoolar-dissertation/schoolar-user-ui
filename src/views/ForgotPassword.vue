<template>
  <guest-layout>
    <div class="columns">
      <div class="column is-6 is-offset-3">
        <div class="card">
          <div class="card-header">
            <h5 class="card-header-title">Forgot your password</h5>
          </div>
          <div class="card-content">
            <form>
              <base-input label="Email" type="email" :v="$v.email" v-model="email"/>
              <base-button type="primary" @click="resetMethod" :disabled="loading">Send email</base-button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </guest-layout>
</template>

<script>
import FORGOT_PASS from '../graphql/Auth/ForgotPass.gql';

import errorHandler from '../utils/errorHandler';

import loadingMixin from '../mixins/loadingMixin';
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

import GuestLayout from '@/layouts/GuestLayout';

import BaseInput from '@/components/BaseInput.vue';
import BaseButton from '@/components/BaseButton.vue';

export default {
  name: 'forgot-password',
  data: () => ({
    email: ''
  }),
  mixins: [validationMixin, loadingMixin],
  components: {
    GuestLayout,
    BaseInput,
    BaseButton
  },
  validations: {
    email: {
      required
    }
  },
  methods: {
    async resetMethod() {
      if (!this.$v.$invalid) {
        this.loading = true;
        try {
          await this.$apollo.mutate({
            mutation: FORGOT_PASS,
            variables: {
              email: this.email
            }
          });
          this.$router.replace('/login');
        } catch (e) {
          errorHandler(e);
        }
        this.loading = false;
      }
    }
  }
};
</script>
