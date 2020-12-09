<?php

namespace Octave\CMSBundle\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Extension\PrependExtensionInterface;
use Symfony\Component\DependencyInjection\Loader;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class OctaveCMSExtension extends Extension implements PrependExtensionInterface
{
    /**
     * @param array $configs
     * @param ContainerBuilder $container
     */
    public function load(array $configs, ContainerBuilder $container)
    {
        $loader = new Loader\YamlFileLoader($container, new FileLocator(__DIR__ . '/../Resources/config'));
        $loader->load('services.yml');

        $configuration = new Configuration();
        $config = $this->processConfiguration($configuration, $configs);

        $definition = $container->getDefinition('octave.cms.page.manager');
        if (isset($config['text_page_templates'])) {
            $definition->addMethodCall('setTextPageTemplates', [$config['text_page_templates']]);
        }

        if (isset($config['media_upload_path'])) {
            $container->setParameter('octave.cms.media.upload_dir', $config['media_upload_path']);
        }

        if (isset($config['media_resized_path'])) {
            $container->setParameter('octave.cms.media.resized_dir', $config['media_resized_path']);
        }

        $container->addAliases([
            'octave.cms.media_gallery_item.data_transformer' => $config['media_gallery_item_transformer']
                ?? 'octave.cms.media_gallery_item.data_transformer.default',
            'octave.cms.media_gallery.data_transformer' => $config['media_gallery_transformer']
                ?? 'octave.cms.media_gallery.data_transformer.default'
        ]);

        if (isset($config['resize_options'])) {
            $container->setParameter('octave.cms.media.resize_options', $config['resize_options']);
        }

        if (isset($config['file_types'])) {
            $container->setParameter('octave.cms.media.file_types', $config['file_types']);
        }

        $container->setParameter('octave.cms.route_options', $config['route_options'] ?? []);
        $container->setParameter('octave.cms.handle_xhr_requests', $config['handle_xhr_requests'] ?? false);
    }

    /**
     * @param ContainerBuilder $container
     */
    public function prepend(ContainerBuilder $container)
    {
        $container->loadFromExtension('twig', array(
            'paths' => array(
                '%kernel.project_dir%/vendor/octave/cms-bundle/src/Resources/views/SonataAdminBundle' => 'SonataAdmin', // You use the namespace you found earlier here. Discard the `@` symbol.
            ),
        ));
    }
}