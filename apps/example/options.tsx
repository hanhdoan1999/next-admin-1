import AddTagDialog from "@/components/PostAddTagDialogContent";
import UserDetailsDialog from "@/components/UserDetailsDialogContent";
import { NextAdminOptions } from "@premieroctet/next-admin";
import DatePicker from "./components/DatePicker";
import PasswordInput from "./components/PasswordInput";
import { prisma } from "./prisma";



export const options: NextAdminOptions = {
  title: "⚡️ My Admin",
  model: {
    User: {
      toString: (user) => `${user.name} (${user.email})`,
      permissions: ["edit", "delete", "create"],
      title: "Users",
      icon: "UsersIcon",
      aliases: {
        id: "ID",
        name: "Full name",
        birthDate: "Date of birth",
        newPassword: "Password",
      },
      list: {
        exports: {
          format: "CSV",
          url: "/api/users/export",
        },
        display: ["id", "name", "email", "posts", "role", "birthDate"],
        search: ["name", "email", "role"],
        copy: ["email"],
        filters: [
          {
            name: "is Admin",
            active: false,
            value: {
              role: {
                equals: "ADMIN",
              },
            },
          },
          {
            name: "@premieroctet.com",
            active: false,
            value: {
              email: {
                endsWith: "@premieroctet.com",
              },
            },
          },
        ],
        fields: {
          role: {
            formatter: (role) => {
              return (
                <strong className="dark:text-white">{role.toString()}</strong>
              );
            },
          },
          birthDate: {
            formatter: (date, context) => {
              return new Date(date as unknown as string)
                ?.toLocaleString(context?.locale ?? "en")
                .split(/[\s,]+/)[0];
            },
          },
        },
      },
      edit: {
        display: [
          "id",
          "name",
          {
            title: "Email is mandatory",
            id: "email-notice",
            description: "You must add an email from now on",
          } as const,
          "email",
          "posts",
          "role",
          "birthDate",
          "avatar",
          "metadata",
          "newPassword",
        ],
        styles: {
          _form: "grid-cols-3 gap-4 md:grid-cols-4",
          id: "col-span-2 row-start-1",
          name: "col-span-2 row-start-1",
          "email-notice": "col-span-4 row-start-2",
          email: "col-span-4 md:col-span-2 row-start-3",
          newPassword: "col-span-3 row-start-4",
          posts: "col-span-4 md:col-span-2 row-start-5",
          role: "col-span-4 md:col-span-3 row-start-6",
          birthDate: "col-span-3 row-start-7",
          avatar: "col-span-4 row-start-8",
          metadata: "col-span-4 row-start-9",
        },
        fields: {
          name: {
            required: true,
            validate: (name) =>
              (name && name.length > 2) || "form.user.name.error",
          },
          email: {
            validate: (email) => email.includes("@") || "form.user.email.error",
            helperText: "Must be a valid email address",
            tooltip: "Make sure to include the @",
          },
          birthDate: {
            input: <DatePicker />,
          },
          posts: {
            display: "list",
            orderField: "order",
          },
          avatar: {
            format: "file",
            handler: {
              /*
               * Include your own upload handler here,
               * for example you can upload the file to an S3 bucket.
               * Make sure to return a string.
               */
              upload: async (buffer, infos, context) => {
                return "https://raw.githubusercontent.com/premieroctet/next-admin/33fcd755a34f1ec5ad53ca8e293029528af814ca/apps/example/public/assets/logo.svg";
              },
            },
          },
          metadata: {
            format: "json",
            validate: (value) => {
              try {
                if (!value) {
                  return true;
                }
                JSON.parse(value as string);
                return true;
              } catch {
                return "Invalid JSON";
              }
            },
          },
        },
        customFields: {
          newPassword: {
            input: <PasswordInput />,
            required: true,
          },
        },
        hooks: {
          beforeDb: async (data, mode, request) => {
            const newPassword = data.newPassword;
            if (newPassword) {
              data.hashedPassword = `hashed-${newPassword}`;
            }

            return data;
          },
        },
      },
      actions: [
        {
          type: "server",
          id: "submit-email",
          icon: "EnvelopeIcon",
          title: "actions.user.email.title",
          action: async (ids) => {
            console.log("Sending email to " + ids.length + " users");
            return {
              type: "success",
              message: "Email sent successfully",
            };
          },
          successMessage: "actions.user.email.success",
          errorMessage: "actions.user.email.error",
        },
        {
          type: "dialog",
          icon: "EyeIcon",
          canExecute: (item) => item.role === "ADMIN",
          id: "user-details",
          title: "actions.user.details.title",
          component: <UserDetailsDialog />,
          depth: 3,
        },
      ],
    },
    Post: {
      toString: (post) => `${post.title}`,
      title: "Posts",
      icon: "NewspaperIcon",
      permissions: ["edit", "delete", "create"],
      actions: [
        {
          type: "server",
          id: "publish",
          icon: "CheckIcon",
          title: "actions.post.publish.title",
          action: async (ids) => {
            console.log("Publishing " + ids.length + " posts");
            await prisma.post.updateMany({
              where: {
                id: {
                  in: ids.map((id) => Number(id)),
                },
              },
              data: {
                published: true,
              },
            });
            return {
              type: "success",
              message: "actions.post.publish.success",
            };
          },
          successMessage: "actions.post.publish.success",
          errorMessage: "actions.post.publish.error",
        },
        {
          type: "dialog",
          icon: "TagIcon",
          id: "add-tag",
          title: "actions.post.add-tag.title",
          component: <AddTagDialog />,
        },
      ],
      list: {
        exports: [
          { format: "CSV", url: "/api/posts/export?format=csv" },
          { format: "JSON", url: "/api/posts/export?format=json" },
        ],
        display: [
          "id",
          "title",
          "published",
          "author",
          "categories",
          "rate",
          "tags",
        ],
        filters: [
          {
            name: "Published",
            active: false,
            value: {
              published: true,
            },
          },
          {
            name: "Unpublished",
            active: false,
            value: {
              published: false,
            },
          },
          async function byCategoryFilters() {
            const categories = await prisma.category.findMany({
              select: { id: true, name: true },
              take: 5,
            });

            return categories.map((category) => ({
              name: category.name,
              value: { categories: { some: { id: category.id } } },
              active: false,
              group: "by_category_id",
            }));
          },
        ],
        search: ["title", "content", "tags", "author.name"],
        fields: {
          author: {
            formatter: (author) => {
              return <strong>{author.name}</strong>;
            },
          },
          published: {
            formatter: (value: boolean) => {
              return value ? "Published" : "Unpublished";
            },
          },
        },
      },
      edit: {
        fields: {
          content: {
            format: "richtext-html",
          },
          categories: {
            relationOptionFormatter: (category) => {
              return `${category.name} Cat.${category.id}`;
            },
            display: "list",
            orderField: "order",
            relationshipSearchField: "category",
          },
        },
        display: [
          "id",
          "title",
          "content",
          "published",
          "categories",
          "author",
          "rate",
          "tags",
        ],
        hooks: {
          async beforeDb(data, mode, request) {
            console.log("intercept beforedb", data, mode, request);

            return data;
          },
          async afterDb(response, mode, request) {
            console.log("intercept afterdb", response, mode, request);

            return response;
          },
        },
      },
    },
    Category: {
      title: "Categories",
      icon: "InboxStackIcon",
      toString: (category) => `${category.name}`,
      list: {
        display: ["name", "posts"],
      },
      edit: {
        display: ["name", "posts"],
        fields: {
          posts: {
            display: "list",
            relationshipSearchField: "post",
            orderField: "order",
          },
        },
      },
    },
    Game: {
      toString: (game) => `${game.title}`,
      title: "Game",
      icon: "RocketLaunchIcon",
      aliases: {
        game_id: "ID",
        title: "Title",
        description: "Description",
        deeplink_url: "Deeplink"
      },
      list: {
        display: ["game_id", "title", "description", "deeplink_url"],
        search: ["title"],
        copy: ["title"],
      },
    },
    Account: {
    title: "Accounts",
    icon: "UserIcon",
    toString: (account) => `${account.arcade_username || account.email || account.wallet_address}`,
    list: {
      display: ["arcade_username", "wallet_address", "email", "created_at"],
    },
    edit: {
      display: ["arcade_username", "wallet_address", "email", "id_token", "verifier_id", "created_at", "updated_at"],
    },
    },
    Profile: {
      title: "Profiles",
      icon: "UserCircleIcon",
      toString: (profile) => `${profile.x_handle || profile.discord_handle || profile.telegram_handle}`,
      list: {
        display: ["account_id", "x_handle", "discord_handle", "telegram_handle", "is_receive_notification", "created_at"],
      },
      edit: {
        display: ["account_id", "display_picture", "x_handle", "discord_handle", "telegram_handle", "is_receive_notification", "created_at", "updated_at"],
      },
    },
    PlayerLaunchGame: {
      title: "Player Launch Games",
      icon: "FireIcon",
      toString: (playerLaunchGame) => `${playerLaunchGame.player_game_id}`,
      list: {
        display: ["account_id", "game_id", "timestamp_of_last_launch", "created_at"],
      },
      edit: {
        display: ["account_id", "game_id", "timestamp_of_last_launch", "created_at", "updated_at"],
      },
    },
    Blockchain: {
      title: "Blockchains",
      icon: "CubeIcon",
      toString: (blockchain) => `${blockchain.blockchain_name}`,
      list: {
        display: ["blockchain_name", "created_at", "updated_at"],
      },
      edit: {
        display: ["blockchain_name", "blockchain_logo", "created_at", "updated_at"],
      },
    },
    GameTag: {
      title: "Game Tags",
      icon: "TagIcon",
      toString: (gameTag) => `${gameTag.game_tag_description}`,
      list: {
        display: ["game_tag_description", "created_at", "updated_at"],
      },
      edit: {
        display: ["game_tag_description", "created_at", "updated_at"],
      },
    },
    GameTagRelation: {
      title: "Game Tag Relations",
      icon: "LinkIcon",
      toString: (gameTagRelation) => `${gameTagRelation.game_id} - ${gameTagRelation.game_tag_id}`,
      list: {
        display: ["game_id", "game_tag_id", "created_at", "updated_at"],
      },
      edit: {
        display: ["game_id", "game_tag_id", "created_at", "updated_at"],
      },
    },
    GameSection: {
      title: "Game Sections",
      icon: "Square2StackIcon",
      toString: (gameSection) => `${gameSection.title}`,
      list: {
        display: ["title", "order_index", "created_at", "updated_at"],
      },
      edit: {
        display: ["title", "order_index", "created_at", "updated_at"],
      },
    },
    GameSectionRelation: {
      title: "Game Section Relations",
      icon: "LinkIcon",
      toString: (gameSectionRelation) => `${gameSectionRelation.game_id} - ${gameSectionRelation.game_section_id}`,
      list: {
        display: ["game_id", "game_section_id", "game_order_in_section", "created_at", "updated_at"],
      },
      edit: {
        display: ["game_id", "game_section_id", "game_order_in_section", "created_at", "updated_at"],
      },
    },
    GamePlatform: {
      title: "Game Platforms",
      icon: "CubeTransparentIcon",
      toString: (gamePlatform) => `${gamePlatform.game_platform_name}`,
      list: {
        display: ["game_platform_name", "created_at", "updated_at"],
      },
      edit: {
        display: ["game_platform_name", "game_platform_logo", "created_at", "updated_at"],
      },
    },
    GamePlatformRelation: {
      title: "Game Platform Relations",
      icon: "LinkIcon",
      toString: (gamePlatformRelation) => `${gamePlatformRelation.game_id} - ${gamePlatformRelation.game_platform_id}`,
      list: {
        display: ["game_id", "game_platform_id", "created_at", "updated_at"],
      },
      edit: {
        display: ["game_id", "game_platform_id", "created_at", "updated_at"],
      },
    },
    GameMedia: {
      title: "Game Media",
      icon: "PhotoIcon",
      toString: (gameMedia) => `${gameMedia.game_id} - ${gameMedia.file_type}`,
      list: {
        display: ["game_id", "medium_url", "file_type", "created_at", "updated_at"],
      },
      edit: {
        display: ["game_id", "medium_url", "file_type", "created_at", "updated_at"],
      },
    },
  
  },
  // pages: {
  //   "/custom": {
  //     title: "Custom page",
  //     icon: "PresentationChartBarIcon",
  //   },
  // },
  sidebar: {
    groups: [
      {
        title: "",
        models: ["User", "Game", "Account", "Profile", "PlayerLaunchGame", "Blockchain", "GameTag", "GameTagRelation", "GameSection", "GameSectionRelation", "GamePlatform", "GamePlatformRelation", "GameMedia"],
      },
      // {
      //   title: "Categories",
      //   models: ["Category"],
      // },
    ],
  },
  // externalLinks: [
  //   {
  //     label: "Documentation",
  //     url: "https://next-admin.js.org",
  //   },
  //   {
  //     label: "Page Router",
  //     url: "/pagerouter/admin",
  //   },
  // ],
  defaultColorScheme: "dark",
};