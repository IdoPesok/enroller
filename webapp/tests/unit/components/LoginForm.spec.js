import LoginForm from "@/components/LoginForm.vue";
import Vuex from "vuex";
import Buefy from "buefy";
import { shallowMount, createLocalVue } from "@vue/test-utils";
const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Buefy);

describe("LoginForm.vue", () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store();
    store.dispatch = jest.fn();
    store.dispatch.mockReturnValue(Promise.resolve());
  });

  it("should call login if form is filled out correctly", () => {
    let form = shallowMount(LoginForm, {
      localVue,
      store,
      stubs: {
        "b-input": false
      }
    });
    let username = "test@test.com";
    let password = "test";
    form.setData({ email: username, password });
    form.find("button.is-primary").trigger("click");
    expect(store.dispatch).toHaveBeenCalledWith("login", {
      email: username,
      password
    });
  });
});
