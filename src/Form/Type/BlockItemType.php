<?php

namespace VideInfra\CMSBundle\Form\Type;
use A2lix\TranslationFormBundle\Form\Type\TranslationsType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolver;
use VideInfra\CMSBundle\Entity\Block;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class BlockItemType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $type = $options['block_type'];
        $contentType = $options['content_type'];

        $builder
            ->add('order', HiddenType::class)
            ->add('type', HiddenType::class, [
                'data' => $type
            ])
            ->add('translations', TranslationsType::class, [
                'label' => false,
                'locales' => $options['locales'],
                'fields' => [
                    'content' => ['field_type' => $contentType, 'label' => false]
                ]
            ])
        ;
    }

    /**
     * @param FormView $view
     * @param FormInterface $form
     * @param array $options
     */
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $view->vars['block_type'] = $options['block_type'];
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => Block::class,
            'block_type' => 'text',
            'content_type' => TextType::class,
            'locales' => ['en']
        ));
    }
}