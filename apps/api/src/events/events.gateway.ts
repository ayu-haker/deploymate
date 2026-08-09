import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { WsDeploymentLogEvent, WsDeploymentStatusEvent } from '@deploymate/types';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'deployments',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_deployment')
  handleJoinDeployment(
    @MessageBody() data: { deploymentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.deploymentId) {
      client.join(`deployment_${data.deploymentId}`);
      this.logger.log(`Client ${client.id} joined deployment_${data.deploymentId}`);
    }
  }

  @SubscribeMessage('leave_deployment')
  handleLeaveDeployment(
    @MessageBody() data: { deploymentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.deploymentId) {
      client.leave(`deployment_${data.deploymentId}`);
    }
  }

  // Helper method invoked by worker/deployment engine to push live logs
  public broadcastLog(event: WsDeploymentLogEvent) {
    this.server.to(`deployment_${event.deploymentId}`).emit('deployment_log', event);
  }

  // Helper method to push deployment status change
  public broadcastStatus(event: WsDeploymentStatusEvent) {
    this.server.to(`deployment_${event.deploymentId}`).emit('deployment_status', event);
    this.server.emit('global_project_status', event);
  }
}
