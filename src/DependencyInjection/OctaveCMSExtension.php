<?php

namespace Octave\CMSBundle\DependencyInjection;

use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;
use Symfony\Component\DependencyInjection\Loader;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class OctaveCMSExtension extends Extension
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
    }
}