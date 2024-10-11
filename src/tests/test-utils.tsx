import { render, renderHook } from "@testing-library/react-native";
import SafeThemeProvider from "../providers/SafeThemeProvider";

// Add in any providers here if necessary:
// (ReduxProvider, ThemeProvider, etc)
const getProviders: () => React.FC<{ children: React.ReactElement }> = () =>
  function ProviderComponent({ children }) {
    return <SafeThemeProvider>{children}</SafeThemeProvider>;
  };

const customRender = (ui: React.ReactElement) => {
  const wrapper = getProviders();

  return render(ui, { wrapper });
};

function customRenderHook<Result, Props>(
  render: (initialProps: Props) => Result
) {
  const wrapper = getProviders();

  return renderHook(render, { wrapper });
}

// re-export everything
export * from "@testing-library/react-native";

// override render method
export { customRender as render };
export { customRenderHook as renderHook };
