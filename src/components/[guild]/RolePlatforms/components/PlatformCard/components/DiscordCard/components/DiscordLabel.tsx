import { Text } from "@chakra-ui/react"
import useGuild from "components/[guild]/hooks/useGuild"
import { useRolePlatform } from "components/[guild]/RolePlatforms/components/RolePlatformProvider"
import useDCAuth from "components/[guild]/RolesByPlatform/components/JoinButton/components/JoinModal/hooks/useDCAuth"
import useServerData from "hooks/useServerData"
import { useEffect, useMemo } from "react"
import { useFormContext, useFormState, useWatch } from "react-hook-form"
import { PlatformType } from "types"
import pluralize from "utils/pluralize"

const BaseLabel = ({ isAdded = false }: { isAdded?: boolean }) => {
  const { guildPlatforms } = useGuild()
  const { nativePlatformId, discordRoleId: formDiscordRoleId } = useRolePlatform()
  const { authorization } = useDCAuth("guilds")
  const roleType = useWatch({ name: "roleType" })

  const {
    data: { roles },
  } = useServerData(nativePlatformId)

  const rolesById = useMemo(
    () => Object.fromEntries(roles.map((role) => [role.id, role])),
    [roles]
  )

  const rolePlatforms = useWatch({ name: "rolePlatforms" })
  const discordGuildPlatformId = guildPlatforms?.find(
    (p) => p.platformId === PlatformType.DISCORD
  )?.id
  const discordRolePlatformIndex = rolePlatforms
    .map((p) => p.guildPlatformId)
    .indexOf(discordGuildPlatformId)

  const discordRoleId = useWatch({
    name: `rolePlatforms.${discordRolePlatformIndex}.platformRoleId`,
    defaultValue: formDiscordRoleId,
  })

  const {
    data: { categories },
  } = useServerData(nativePlatformId, { authorization })

  const gatedChannels = useWatch({
    name: `rolePlatforms.${discordRolePlatformIndex}.platformRoleData.gatedChannels`,
    defaultValue: {},
  })

  const isGuarded = useWatch({
    name: `rolePlatforms.${discordRolePlatformIndex}.platformRoleData.isGuarded`,
  })

  const numOfGatedChannels = useMemo(
    () =>
      Object.values(gatedChannels ?? {})
        .flatMap(
          ({ channels }) =>
            Object.values(channels ?? {}).map(({ isChecked }) => +isChecked) ?? []
        )
        .reduce((acc, curr) => acc + curr, 0),
    [gatedChannels]
  )

  const { setValue } = useFormContext()
  const { touchedFields } = useFormState()

  useEffect(() => {
    if (!categories || categories.length <= 0) return

    setValue(
      `rolePlatforms.${discordRolePlatformIndex}.platformRoleData.gatedChannels`,
      Object.fromEntries(
        categories.map(({ channels, id, name }) => [
          id,
          {
            name,
            channels: Object.fromEntries(
              (channels ?? []).map((channel) => [
                channel.id,
                {
                  name: channel.name,
                  isChecked: touchedFields.gatedChannels?.[id]?.channels?.[
                    channel.id
                  ]
                    ? gatedChannels?.[id]?.channels?.[channel.id]?.isChecked
                    : channel.roles.includes(discordRoleId),
                },
              ])
            ),
          },
        ])
      )
    )
  }, [categories, discordRoleId])

  return (
    <Text>
      {isAdded &&
        ((roleType === "NEW" && "Create a new role for me, ") ||
          `Guildify the ${
            (!!rolesById?.[discordRoleId]?.name &&
              ` "${rolesById[discordRoleId].name}"`) ||
            ""
          } role, `)}
      {isGuarded ? "guard server" : pluralize(numOfGatedChannels, "gated channel")}
    </Text>
  )
}

export default BaseLabel