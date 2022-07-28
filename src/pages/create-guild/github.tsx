import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  SimpleGrid,
  Spinner,
  VStack,
} from "@chakra-ui/react"
import Layout from "components/common/Layout"
import RepoCard from "components/create-guild/github/RepoCard"
import useUser from "components/[guild]/hooks/useUser"
import useGateables from "hooks/useGateables"
import { useRouter } from "next/router"
import { useEffect } from "react"

const CreateGithubGuild = () => {
  const { platformUsers } = useUser()
  const isGithubConnected = platformUsers?.some(
    ({ platformName }) => platformName === "GITHUB"
  )
  const router = useRouter()

  useEffect(() => {
    if (platformUsers !== undefined && isGithubConnected === false) {
      router.push("/create-guild")
    }
  }, [platformUsers, isGithubConnected])

  /**
   * TODO: Once signing keypair is merged, use SWR with fetcherWithSign here instead
   * of useSubmitWitkSign & useEffect
   */
  const { onSubmit, response, isLoading, isSigning, error } = useGateables()
  useEffect(() => {
    if (!response) onSubmit({ platformName: "GITHUB" })
  }, [response])

  return (
    <Layout title="Create Guild on GitHub">
      {isLoading || isSigning ? (
        <Spinner />
      ) : error ? (
        <Alert status="error">
          <AlertIcon />
          <VStack alignItems="start">
            <AlertTitle>GitHub error</AlertTitle>
            <AlertDescription>
              Failed to retrieve repositories, try disconnecting your GitHub account
            </AlertDescription>
          </VStack>
        </Alert>
      ) : response ? (
        <SimpleGrid w="full" columns={{ base: 1, md: 2 }} gap={5}>
          {response?.map((repo) => (
            <RepoCard key={repo.platformGuildId} {...repo} />
          ))}
        </SimpleGrid>
      ) : null}
    </Layout>
  )
}

export default CreateGithubGuild