import { actions } from "@/store.js";
import mockAxios from "jest-mock-axios";

describe("store", () => {
  describe("actions", () => {
    afterEach(() => {
      mockAxios.reset();
    });

    it("should send a login to axios", () => {
      let commit = jest.fn();
      actions.login({ commit }, { email: "test", password: "test" });
      expect(mockAxios.post).toHaveBeenCalledWith("/api/login", {
        email: "test",
        password: "test"
      });
      mockAxios.mockResponse({ data: { success: true }, status: 200 });
      expect(commit).toHaveBeenCalledWith("login");
    });
  });
});
