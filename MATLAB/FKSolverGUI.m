classdef FKSolverGUI < matlab.apps.AppBase

    % Properties that correspond to app components
    properties (Access = public)
        UIFigure               matlab.ui.Figure
        GridLayout             matlab.ui.container.GridLayout
        LeftPanel              matlab.ui.container.Panel
        RightPanel             matlab.ui.container.Panel
        JointControlsPanel     matlab.ui.container.Panel
        ResultsPanel           matlab.ui.container.Panel
        UIAxes                 matlab.ui.control.UIAxes
    end

    properties (Access = private)
        Robot % RigidBodyTree object
        JointEditFields        % Array of joint edit fields
        PositionLabel          % Label for position
        OrientationLabel       % Label for orientation
    end

    methods (Access = private)

        function updateRobotVisualization(app)
            % Get joint angles from edit fields
            jointAngles = zeros(1, 6);
            for i = 1:6
                jointAngles(i) = app.JointEditFields(i).Value;
            end
            
            % Apply offset to second joint
            jointAngles(2) = jointAngles(2) - 90;

            % Convert joint angles to radians
            jointAnglesRad = deg2rad(jointAngles);

            % Create a configuration object
            config = homeConfiguration(app.Robot);
            for i = 1:6
                config(i).JointPosition = jointAnglesRad(i);
            end

            % Compute forward kinematics
            T = getTransform(app.Robot, config, 'body6', 'base');
            
            % Extract position
            position = T(1:3, 4);
            
            % Extract orientation (roll, pitch, yaw)
            rotationMatrix = T(1:3, 1:3);
            eulAngles = rotm2eul(rotationMatrix, 'XYZ');
            
            % Convert to degrees
            rollDeg = rad2deg(eulAngles(1));
            pitchDeg = rad2deg(eulAngles(2));
            yawDeg = rad2deg(eulAngles(3));
            
            % Update position and orientation labels
            app.PositionLabel.Text = sprintf('Position: [%.2f, %.2f, %.2f]', position(1), position(2), position(3));
            app.OrientationLabel.Text = sprintf('Orientation (RPY): [%.2f, %.2f, %.2f]', rollDeg, pitchDeg, yawDeg);

            % Clear the axes
            cla(app.UIAxes);

            % Plot the robot
            positions = zeros(3, 7);
            positions(:, 1) = [0; 0; 0];  % Base position

            for i = 1:6
                T = getTransform(app.Robot, config, ['body' num2str(i)], 'base');
                positions(:, i+1) = T(1:3, 4);
            end

            % Plot the links
            plot3(app.UIAxes, positions(1, :), positions(2, :), positions(3, :), 'k-', 'LineWidth', 2);
            hold(app.UIAxes, 'on');

            % Plot the joints
            plot3(app.UIAxes, positions(1, :), positions(2, :), positions(3, :), 'ro', 'MarkerSize', 8, 'MarkerFaceColor', 'r');

            % Set axis properties
            axis(app.UIAxes, 'equal');
            grid(app.UIAxes, 'on');
            xlabel(app.UIAxes, 'X');
            ylabel(app.UIAxes, 'Y');
            zlabel(app.UIAxes, 'Z');
            title(app.UIAxes, 'Robot Arm Configuration');

            % Set view
            view(app.UIAxes, 3);

            % Set limits
            maxRange = max(max(abs(positions(:))));
            app.UIAxes.XLim = [-maxRange, maxRange];
            app.UIAxes.YLim = [-maxRange, maxRange];
            app.UIAxes.ZLim = [-maxRange, maxRange];

            hold(app.UIAxes, 'off');
        end

        function initializeRobot(app)
            % Initialize robot with DH parameters
            DHParams = [0,    -pi/2,  10,   0;
                        50,   0,      0,    -pi/2;
                        0,    -pi/2,  5,    0;
                        0,    pi/2,   50,   0;
                        0,    -pi/2,  0,    0;
                        0,    0,      10,   0];
            
            app.Robot = rigidBodyTree;
            for i = 1:6
                body = rigidBody(['body' num2str(i)]);
                joint = rigidBodyJoint(['joint' num2str(i)], 'revolute');
                setFixedTransform(joint, DHParams(i, :), 'dh');
                body.Joint = joint;
                if i == 1
                    addBody(app.Robot, body, 'base');
                else
                    addBody(app.Robot, body, ['body' num2str(i-1)]);
                end
            end
        end
    end

    % Callbacks that handle component events
    methods (Access = private)

        % Value changed function: Joint edit fields
        function JointValueChanged(app, ~)
            updateRobotVisualization(app);
        end
    end

    % Component initialization
    methods (Access = private)

        % Create UIFigure and components
        function createComponents(app)

            % Create UIFigure and hide until all components are created
            app.UIFigure = uifigure('Visible', 'off');
            app.UIFigure.Position = [100 100 1000 600];
            app.UIFigure.Name = 'FK Solver GUI';

            % Create GridLayout
            app.GridLayout = uigridlayout(app.UIFigure);
            app.GridLayout.ColumnWidth = {'1x', '2x'};
            app.GridLayout.RowHeight = {'1x'};

            % Create LeftPanel
            app.LeftPanel = uipanel(app.GridLayout);
            app.LeftPanel.Layout.Row = 1;
            app.LeftPanel.Layout.Column = 1;

            % Create JointControlsPanel
            app.JointControlsPanel = uipanel(app.LeftPanel);
            app.JointControlsPanel.Title = 'Joint Controls';
            app.JointControlsPanel.Position = [10 200 280 380];

            % Create ResultsPanel
            app.ResultsPanel = uipanel(app.LeftPanel);
            app.ResultsPanel.Title = 'Results';
            app.ResultsPanel.Position = [10 10 280 180];

            % Create RightPanel
            app.RightPanel = uipanel(app.GridLayout);
            app.RightPanel.Layout.Row = 1;
            app.RightPanel.Layout.Column = 2;

            % Create joint edit fields and labels
            app.JointEditFields = gobjects(6, 1);
            
            for i = 1:6
                % Create Label
                label = uilabel(app.JointControlsPanel);
                label.HorizontalAlignment = 'right';
                label.Position = [10 340-50*i 50 22];
                label.Text = ['Joint ' num2str(i)];

                % Create Edit Field
                app.JointEditFields(i) = uieditfield(app.JointControlsPanel, 'numeric');
                app.JointEditFields(i).Limits = [-180 180];
                app.JointEditFields(i).Position = [70 340-50*i 100 22];
                app.JointEditFields(i).ValueChangedFcn = createCallbackFcn(app, @JointValueChanged, true);
                app.JointEditFields(i).Value = 0;  % Initialize to 0
            end

            % Create PositionLabel
            app.PositionLabel = uilabel(app.ResultsPanel);
            app.PositionLabel.Position = [10 120 260 22];
            app.PositionLabel.Text = 'Position: [0.00, 0.00, 0.00]';

            % Create OrientationLabel
            app.OrientationLabel = uilabel(app.ResultsPanel);
            app.OrientationLabel.Position = [10 90 260 22];
            app.OrientationLabel.Text = 'Orientation: [0.00, 0.00, 0.00]';

            % Create UIAxes
            app.UIAxes = uiaxes(app.RightPanel);
            app.UIAxes.Position = [10 10 630 580];
            title(app.UIAxes, 'Robot Arm Configuration')
            xlabel(app.UIAxes, 'X')
            ylabel(app.UIAxes, 'Y')
            zlabel(app.UIAxes, 'Z')

            % Show the figure after all components are created
            app.UIFigure.Visible = 'on';
        end
    end

    % App creation and deletion
    methods (Access = public)

        % Construct app
        function app = FKSolverGUI

            % Create UIFigure and components
            createComponents(app)

            % Register the app with App Designer
            registerApp(app, app.UIFigure)

            % Initialize robot
            initializeRobot(app)

            % Initial update of robot visualization
            updateRobotVisualization(app)

            if nargout == 0
                clear app
            end
        end

        % Code that executes before app deletion
        function delete(app)

            % Delete UIFigure when app is deleted
            delete(app.UIFigure)
        end
    end
end