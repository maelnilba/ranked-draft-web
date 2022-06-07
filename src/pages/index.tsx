import { Flex } from "@chakra-ui/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GlobalBackground } from "../components/navigation/GlobalBackground";
import { useTheme } from "../hooks/useTheme";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";
import { paramsToObject } from "../utils/HelpersFunction";
import { Loading } from "../components/Loading";
import { Background } from "../components/sign/Background";
import { Sign } from "../containers/Sign";
import { Showing } from "../containers/Showing";
import { useWindowSize } from "../hooks/useWindowSize";
import { Layout } from "../components/Layout";

const Index = () => {
  const { t } = useTranslation(["home"]);
  const { backgroundColor } = useTheme({ invert: true, variant: "info" });
  const { isMobile, isPad, isScreen } = useWindowSize();
  const { isDark, theme } = useTheme();
  const [isRedirect, setIsRedirect] = useState(false);

  const { asPath } = useRouter();

  useEffect(() => {
    try {
      const params = paramsToObject(asPath.split("#")[1]);
      if (params) {
        const { access_token } = params;
        if (access_token) setIsRedirect(true);
      }
    } catch (error) {}
  }, []);

  return (
    <Layout direction="column">
      <Flex width="100%" height="100vh" {...backgroundColor}>
        <GlobalBackground />
        {isRedirect && <Loading />}
        {(isScreen || isPad || !isMobile) && (
          <Flex
            bgColor={isDark ? theme[500] : theme[700]}
            flex={isPad ? 0.4 : 0.9}
          >
            <Background />
          </Flex>
        )}

        <Sign borderTopLeftRadius={isMobile ? 0 : "xl"} />
      </Flex>
      <Showing />
    </Layout>
  );
};

export async function getServerSideProps({ locale, req, res }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (user) {
    if (user.aud === "authenticated") {
      return {
        redirect: {
          permanent: false,
          destination: "/home",
        },
      };
    }
  }
  return {
    props: {
      ...(await serverSideTranslations(locale as string, [
        "common",
        "home",
        "sign",
      ])),
    },
  };
}

export default Index;
