import { Client, Message } from 'discord.js';
import { PackDescriptions, PackLinks, Packs } from '@shared/enum/packs.enum';
import {
  adminDocumentation,
  publicDocumentation,
} from '@discord/service/bootstrap.service';

import { Command } from '@discord/decorator/command.decorator';
import { Guards } from '@discord/decorator/guard.decorator';
import { InjectClient } from '@discord/decorator/inject-client.decorator';
import { InjectPrefix } from '@discord/decorator/inject-prefix.decorator';
import { InjectServer } from '@discord/decorator/inject-server.decorator';
import { Injectable } from '@nestjs/common';
import { IsAdminGuard } from '@shared/guard/is-admin.guard';
import { Servers } from '@shared/enum/servers.enum';
import { flatten } from 'lodash';

@Injectable()
export class CommandsGateway {
  @InjectPrefix()
  prefix: string;

  @InjectClient()
  client: Client;

  @InjectServer()
  server: string;

  @Command({ name: '{bot}', action: 'comandos' })
  async showPublicCommands(message: Message): Promise<void> {
    await message.channel.send(
      publicDocumentation.length
        ? this.addSpaceBetween(publicDocumentation)
        : 'No hay comandos disponibles',
    );
  }

  @Guards(IsAdminGuard)
  @Command({ name: '{bot}', action: ['comandos', 'admin'] })
  async showAdminCommands(message: Message): Promise<void> {
    await message.channel.send(
      adminDocumentation.length
        ? this.addSpaceBetween(adminDocumentation)
        : 'No hay comandos disponibles',
    );
  }

  @Guards(IsAdminGuard)
  @Command({ name: '{bot}', action: 'roles' })
  async showAllRoles(message: Message, args: string[]): Promise<void> {
    if (!args.length) {
      await message.channel.send(
        this.client.guilds.cache
          .first()
          .roles.cache.map((role) => `\`${role.id}\`: ${role.name}`),
      );
    } else {
      const role = await this.client.guilds.cache
        .first()
        .roles.cache.find(
          (role) => role.name.toLowerCase() === args.join(' ').toLowerCase(),
        );

      await message.channel.send(
        role ? `\`${role.id}\`: ${role.name}` : 'No se encontró el rol',
      );
    }
  }

  @Guards(IsAdminGuard)
  @Command({ name: '{bot}', action: 'canales' })
  async showAllChannels(message: Message, args: string[]): Promise<void> {
    if (!args.length) {
      await message.channel.send(
        this.client.guilds.cache
          .first()
          .channels.cache.map(
            (channel) => `\`${channel.id}\`: ${channel.name}`,
          ),
      );
    } else {
      const channel = await this.client.guilds.cache
        .first()
        .channels.cache.find(
          (channel) =>
            channel.name.toLowerCase() === args.join(' ').toLowerCase(),
        );

      await message.channel.send(
        channel
          ? `\`${channel.id}\`: ${channel.name}`
          : 'No se encontró el canal',
      );
    }
  }

  @Guards(IsAdminGuard)
  @Command({ name: '{bot}', action: 'emotes' })
  async showAllEmotes(message: Message, args: string[]): Promise<void> {
    if (!args.length) {
      await message.channel.send(
        this.client.guilds.cache
          .first()
          .emojis.cache.map((emoji) => `\`${emoji.id}\`: ${emoji.name}`),
      );
    } else {
      const emoji = await this.client.guilds.cache
        .first()
        .emojis.cache.find(
          (emoji) => emoji.name.toLowerCase() === args.join(' ').toLowerCase(),
        );

      await message.channel.send(
        emoji
          ? `\`${emoji.id}\`: <:${emoji.name}:${emoji.id}>`
          : 'No se encontró el emoji',
      );
    }
  }

  @Command({
    name: '{bot}',
    action: 'packs',
    usage: '[nombre del pack]',
    description: 'Muestra enlaces para descargar distintos packs.',
  })
  async showPacks(message: Message, args: string[]): Promise<void> {
    if (!args.length) {
      await message.channel.send(
        this.addSpaceBetween([
          `A continuación se muestra la lista de los packs disponibles, para ver los enlaces por favor ejecuta el comando \`${this.prefix}${this.server} packs [nombre del paquete]\`:`,
          ...this.getPacksDescriptionMessage(PackDescriptions),
        ]),
      );
    } else {
      const pack: Packs = Object.values(Packs).find(
        (pack) => pack === args.join(' ').toLowerCase(),
      );

      if (!pack) {
        await message.channel.send('No hay enlace para ese pack');
      } else {
        await message.channel.send(
          this.addSpaceBetween([
            PackDescriptions[pack],
            ...this.getPacksMessage(PackLinks[pack]),
          ]),
        );
      }
    }
  }

  @Command({
    name: 'online',
    description: 'Muestra los datos de conexión para la v24 de Clone Hero',
    exceptFor: [Servers.CHH, Servers.RBE],
  })
  async online(message: Message): Promise<void> {
    await message.channel.send([
      'A partir del Public Test Build **v24.0.2478** se puede utilizar un servidor central para jugar, sin la necesidad de instalar y configurar ningún software adicional.',
      '',
      '**SERVIDOR 1**',
      '**IP:** online.plastichero.rocks',
      '**Port:** 2000',
      '**Password:** phc',
      '',
      '**SERVIDOR 2**',
      '**IP:** online.plastichero.rocks',
      '**Port:** 2001',
      '**Password:** phc',
      '',
      '**SERVIDOR 3**',
      '**IP:** online.plastichero.rocks',
      '**Port:** 2002',
      '**Password:** phc',
    ]);
  }

  @Command({
    name: 'ptb',
    description: 'Muestra los enlaces para descargar el Clone Hero Launcher',
    exceptFor: [Servers.CHH, Servers.RBE],
  })
  async ptb(message: Message): Promise<void> {
    await message.channel.send([
      '**Clone Hero Launcher**',
      '',
      '**Windows (x64 Only):** <https://tinyurl.com/y677suu4>',
      '**Linux:** <https://tinyurl.com/yybmranz>',
      '**MacOS:** <https://tinyurl.com/y39zo2uq>',
      '',
      '**QuickStart guide:** <https://tinyurl.com/yxpes2sf>',
    ]);
  }

  private addSpaceBetween(array: string[]): string[] {
    const result: string[] = array.reduce(
      (accumulator, value) => [...accumulator, value, ''],
      [],
    );
    result.pop();
    return result;
  }

  private getPacksDescriptionMessage(links: Object): string[] {
    return flatten(
      Object.keys(links).map(
        (packName: string) => `\`${packName}\`: ${links[packName]}`,
      ),
    );
  }

  private getPacksMessage(links: Object): string[] {
    return flatten(
      Object.keys(links).map(
        (packName: string) => `\`${packName}\`: <${links[packName]}>`,
      ),
    );
  }
}
