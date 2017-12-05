<?php

namespace VideInfra\CMSBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaImageType extends AbstractType
{
    /**
     * @return string
     */
    public function getBlockPrefix()
    {
        return 'media_image';
    }

    /**
     * @return string
     */
    public function getParent()
    {
        return HiddenType::class;
    }

    /**
     * @param FormView $view
     * @param FormInterface $form
     * @param array $options
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $view->vars['show_label'] = $options['show_label'];
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);

        $resolver->setDefaults([
            'locales' => ['en'],
            'show_label' => true
        ]);
    }
}